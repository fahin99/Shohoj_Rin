import { Pool } from "pg";
import { config } from "../config/index.js";
export const pool = new Pool({
  connectionString: config.database.url,
  max: 20, // Limit max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 10000, // 10s query timeout
});
export async function closePool() {
  await pool.end();
}