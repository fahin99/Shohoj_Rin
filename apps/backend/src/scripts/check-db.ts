import { pool } from "../lib/db.js";
async function main() {
  try {
    const tables = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;",
    );
    console.log("=== TABLES FOUND IN DATABASE ===");
    const tableNames = tables.rows.map((r: { table_name: string }) => r.table_name);
    console.log(tableNames);
    console.log("\n=== TABLE ROW COUNTS ===");
    for (const name of tableNames) {
      const res = await pool.query(`SELECT count(*) FROM "${name}"`);
      console.log(`- ${name.padEnd(25)}: ${res.rows[0].count} row(s)`);
    }
    const fks = await pool.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name;
    `);
    console.log(`\n=== FOREIGN KEY CONSTRAINTS (${fks.rows.length} total) ===`);
    console.table(fks.rows);
  } catch (error) {
    console.error("Database connection/query failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
void main();
