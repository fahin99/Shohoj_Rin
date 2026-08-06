import { Pool } from "pg";

import { config } from "../config/index.js";

export const pool = new Pool({
  connectionString: config.database.url,
});

export async function closePool() {
  await pool.end();
}