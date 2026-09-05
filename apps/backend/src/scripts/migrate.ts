import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";
import { pool } from "../lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaFile = "schema.sql";
const migrationDir = path.resolve(__dirname, "../../migrations");

async function hasCanonicalSchema(client: PoolClient) {
  const { rows } = await client.query(`
    SELECT
      to_regclass('public.users') IS NOT NULL
      AND to_regclass('public.user_profiles') IS NOT NULL
      AND to_regclass('public.verification_requests') IS NOT NULL
      AND to_regclass('public.verification_documents') IS NOT NULL
      AND to_regclass('public.investor_profiles') IS NOT NULL
      AND to_regclass('public.loan_products') IS NOT NULL
      AND to_regclass('public.funding_commitments') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'partner_id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'profile_completion_status'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'verification_requests' AND column_name = 'verification_source'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'verification_documents' AND column_name = 'document_status'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'loan_applications' AND column_name = 'product_id'
      ) AS complete
  `);

  return Boolean(rows[0].complete);
}

async function listMigrationFiles() {
  const entries = await fs.readdir(migrationDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();
}

async function ensureFundingCommitments(client: PoolClient) {
  const tableExists = await client.query(`SELECT to_regclass('public.funding_commitments') AS table_name`);
  if (tableExists.rows[0].table_name) return;

  console.log("Canonical schema is missing funding_commitments; repairing it from schema.sql definition...");
  await client.query(`
    CREATE TABLE funding_commitments (
      commitment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID NOT NULL REFERENCES loan_applications (application_id) ON DELETE RESTRICT,
      lender_user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
      amount DECIMAL(12,2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'committed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (application_id, lender_user_id)
    );
  `);
  await client.query(`
    ALTER TABLE funding_commitments
      ADD CONSTRAINT chk_funding_commitments_status CHECK (status IN ('committed', 'cancelled')),
      ADD CONSTRAINT chk_funding_commitments_amount CHECK (amount > 0);
  `);
  await client.query(`
    CREATE INDEX idx_funding_commitments_lender
      ON funding_commitments(lender_user_id, status, created_at DESC);
    CREATE INDEX idx_funding_commitments_application
      ON funding_commitments(application_id, status);
  `);
}

async function ensureLenderMarketplaceSchema(client: PoolClient) {
  await client.query(`
    ALTER TABLE funding_partners
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS branch VARCHAR(255),
      ADD COLUMN IF NOT EXISTS goal VARCHAR(255);
  `);

  const tableExists = await client.query(
    `SELECT to_regclass('public.lender_application_matches') AS table_name`,
  );
  if (tableExists.rows[0].table_name) return;

  console.log("Canonical schema is missing lender_application_matches; creating it...");
  await client.query(`
    CREATE TABLE lender_application_matches (
      match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID NOT NULL REFERENCES loan_applications (application_id) ON DELETE CASCADE,
      lender_user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
      priority INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      viewed_at TIMESTAMPTZ,
      decided_at TIMESTAMPTZ,
      decision_reason TEXT,
      UNIQUE (application_id, lender_user_id)
    );
  `);
  await client.query(`
    ALTER TABLE lender_application_matches
      ADD CONSTRAINT chk_lender_match_status CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected', 'expired'));
  `);
  await client.query(`
    CREATE INDEX idx_lender_matches_lender ON lender_application_matches(lender_user_id, status, matched_at DESC);
    CREATE INDEX idx_lender_matches_application ON lender_application_matches(application_id, priority ASC);
  `);
}

/**
 * Race-safe company creation (item 3): funding_partners.name is only exact-match
 * UNIQUE, so pre-existing databases may already contain rows that differ only by
 * case/whitespace (e.g. "ABC Bank" and " abc bank "). Merge any such duplicates into
 * a single canonical row (the earliest-created one) before installing the normalized
 * unique index the application now relies on for its ON CONFLICT upsert.
 */
async function ensureFundingPartnerNameNormalizedIndex(client: PoolClient) {
  const indexExists = await client.query(
    `SELECT to_regclass('public.idx_funding_partners_name_normalized') AS index_name`,
  );
  if (indexExists.rows[0].index_name) return;

  console.log("Deduplicating funding_partners by normalized name before adding unique index...");
  await client.query(`
    DO $$
    DECLARE
      dup RECORD;
    BEGIN
      FOR dup IN
        SELECT array_agg(partner_id ORDER BY created_at, partner_id) AS ids
        FROM funding_partners
        GROUP BY lower(regexp_replace(btrim(name), '\\s+', ' ', 'g'))
        HAVING COUNT(*) > 1
      LOOP
        UPDATE users SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE loan_products SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE loan_applications SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE loan_offers SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE loans SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE partner_rules SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE partner_decisions SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        DELETE FROM funding_partners WHERE partner_id = ANY(dup.ids[2:]);
      END LOOP;
    END $$;
  `);

  console.log("Creating idx_funding_partners_name_normalized...");
  await client.query(`
    CREATE UNIQUE INDEX idx_funding_partners_name_normalized
      ON funding_partners (lower(regexp_replace(btrim(name), '\\s+', ' ', 'g')));
  `);
}

/**
 * Lender → investor_profiles invariant (item 4): install the trigger that guarantees
 * every users row with role = 'lender' has a matching investor_profiles row, then
 * backfill any pre-existing lender accounts that predate the trigger.
 */
async function ensureLenderInvestorProfileInvariant(client: PoolClient) {
  await client.query(`
    CREATE OR REPLACE FUNCTION ensure_lender_investor_profile()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.role = 'lender' THEN
            INSERT INTO investor_profiles (user_id, verification_status, kyc_status, account_status)
            VALUES (NEW.user_id, 'pending', 'incomplete', 'active')
            ON CONFLICT (user_id) DO NOTHING;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await client.query(`DROP TRIGGER IF EXISTS trg_users_ensure_lender_investor_profile ON users;`);
  await client.query(`
    CREATE TRIGGER trg_users_ensure_lender_investor_profile
      AFTER INSERT OR UPDATE OF role ON users
      FOR EACH ROW EXECUTE PROCEDURE ensure_lender_investor_profile();
  `);

  const backfill = await client.query(`
    INSERT INTO investor_profiles (user_id, verification_status, kyc_status, account_status)
    SELECT user_id, 'pending', 'incomplete', 'active'
    FROM users
    WHERE role = 'lender'
    ON CONFLICT (user_id) DO NOTHING
    RETURNING user_id;
  `);
  if (backfill.rowCount && backfill.rowCount > 0) {
    console.log(
      `Backfilled investor_profiles for ${backfill.rowCount} pre-existing lender account(s).`,
    );
  }
}

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const { rows } = await client.query("SELECT name FROM migrations");
    const executedMigrations = new Set(rows.map((r) => r.name));
    const schemaComplete = await hasCanonicalSchema(client);

    if (schemaComplete) {
      if (!executedMigrations.has(schemaFile)) {
        console.log("Existing canonical database detected. Baselining schema.sql...");
        await client.query(
          "INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
          [schemaFile],
        );
      }

      // schema.sql is the only SQL migration file by design.
      const pendingFiles = (await listMigrationFiles()).filter(
        (file) => file !== schemaFile && !file.startsWith("2026_08_31_fix_funding_commitments"),
      );
      for (const migrationName of pendingFiles) {
        throw new Error(`Unexpected SQL migration file found: ${migrationName}. Keep schema.sql as the sole canonical SQL file.`);
      }

      await ensureLenderMarketplaceSchema(client);
      await ensureFundingPartnerNameNormalizedIndex(client);
      await ensureLenderInvestorProfileInvariant(client);

      console.log("Canonical schema is already installed.");
      return;
    }

    const existingSchemaCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      ) AS exists;
    `);

    if (existingSchemaCheck.rows[0].exists) {
      await ensureFundingCommitments(client);
      await ensureLenderMarketplaceSchema(client);
      await ensureFundingPartnerNameNormalizedIndex(client);
      await ensureLenderInvestorProfileInvariant(client);

      const schemaStillIncomplete = !(await hasCanonicalSchema(client));
      if (schemaStillIncomplete) {
        throw new Error(
          "The existing database is missing required canonical schema fields. Recreate the development database and rerun migrate.",
        );
      }

      if (!executedMigrations.has(schemaFile)) {
        await client.query(
          "INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
          [schemaFile],
        );
      }

      console.log("Applied compatible canonical-schema repair to the existing database.");
      return;
    }

    console.log(`Executing migration: ${schemaFile}`);
    const filePath = path.resolve(migrationDir, schemaFile);
    const sql = await fs.readFile(filePath, "utf-8");

    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(
        "INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
        [schemaFile],
      );
      await client.query("COMMIT");
      console.log(`Migration ${schemaFile} completed successfully.`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`Error executing migration ${schemaFile}:`, error);
      throw error;
    }

    await ensureLenderMarketplaceSchema(client);
    await ensureFundingPartnerNameNormalizedIndex(client);
    await ensureLenderInvestorProfileInvariant(client);

    console.log("Canonical schema installed successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});