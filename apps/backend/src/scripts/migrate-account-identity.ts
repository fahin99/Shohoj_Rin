import { pool } from "../lib/db.js";

async function migrateAccountIdentity() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Existing accounts may not have a username. Keep it nullable for backward
    // compatibility; new registrations are required to provide one.
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)`);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique
      ON users (username)
      WHERE username IS NOT NULL
    `);

    // Registration creates the account before onboarding, where full name is entered.
    // Preserve existing values while allowing new profiles to start incomplete.
    await client.query(`ALTER TABLE user_profiles ALTER COLUMN full_name DROP NOT NULL`);

    await client.query("COMMIT");
    console.log("Account identity migration completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Account identity migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateAccountIdentity().catch(() => process.exit(1));
