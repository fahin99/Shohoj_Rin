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
