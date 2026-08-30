import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";
import { pool } from "../lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaFile = "schema.sql";

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

    if (executedMigrations.has(schemaFile) && !schemaComplete) {
      throw new Error(
        "The database is not compatible with the canonical schema.sql. Recreate the development database and rerun migrate.",
      );
    }

    if (schemaComplete) {
      if (!executedMigrations.has(schemaFile)) {
        console.log("Existing canonical database detected. Baselining schema.sql...");
        await client.query(
          "INSERT INTO migrations (name) VALUES ($1) ON CONFLICT DO NOTHING",
          [schemaFile],
        );
      }
      console.log("Canonical schema is already installed.");
      return;
    }

    const existingSchemaCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      );
    `);

    if (existingSchemaCheck.rows[0].exists) {
      throw new Error(
        "The existing database is missing required canonical schema fields. Recreate the development database and rerun migrate.",
      );
    }

    console.log(`Executing migration: ${schemaFile}`);
    const filePath = path.resolve(__dirname, "../../migrations", schemaFile);
    const sql = await fs.readFile(filePath, "utf-8");

    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO migrations (name) VALUES ($1)", [schemaFile]);
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
