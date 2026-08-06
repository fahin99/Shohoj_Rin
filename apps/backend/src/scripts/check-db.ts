import { pool } from "../lib/db.js";

async function main() {
  try {
    const result = await pool.query("SELECT * FROM users");
    console.log(`Query returned ${result.rowCount} row(s)`);
    console.table(result.rows);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void main();