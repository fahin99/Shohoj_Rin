import { pool } from "../lib/db.js";

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("Starting migration for Trust Score and Institutions...");
    await client.query("BEGIN");

    // 1. Ensure trust_band can hold strings up to 20 chars (e.g. 'very_high_risk')
    await client.query(`
      ALTER TABLE trust_scores 
      ALTER COLUMN trust_band TYPE VARCHAR(20);
    `);

    // 2. Ensure confidence_score column exists on trust_scores
    await client.query(`
      ALTER TABLE trust_scores 
      ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2);
    `);

    // 3. Ensure factor_weight exists on trust_score_factors
    await client.query(`
      ALTER TABLE trust_score_factors 
      ADD COLUMN IF NOT EXISTS factor_weight DECIMAL(3,2);
    `);

    // 4. Ensure index on institutions(name) and institutions(type)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_institutions_name ON institutions(name);
      CREATE INDEX IF NOT EXISTS idx_institutions_type ON institutions(type);
    `);

    // 5. Ensure index on trust_scores(user_id, is_current)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_trust_scores_user_current ON trust_scores(user_id, is_current);
    `);

    await client.query("COMMIT");
    console.log("Migration completed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch((err) => {
  console.error("Migration execution failed:", err);
  process.exit(1);
});
