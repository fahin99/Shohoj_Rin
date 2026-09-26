import { pool } from "../lib/db.js";

async function markOverdueSchedules() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("CALL mark_overdue_schedules()");
    await client.query("COMMIT");
    console.log("Overdue repayment schedules processed successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to process overdue repayment schedules:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

markOverdueSchedules().catch(() => process.exit(1));