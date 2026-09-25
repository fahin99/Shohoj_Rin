import { pool, closePool } from "../lib/db.js";

async function main() {
  const usersWithNull = await pool.query<{ user_id: string; email: string }>(
    "SELECT user_id, email FROM users WHERE username IS NULL",
  );
  console.log(`Found ${usersWithNull.rows.length} users with NULL username.`);

  for (const u of usersWithNull.rows) {
    let base = u.email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, "_");
    if (base.length < 3) base = `${base}_usr`;
    let candidate = base;
    let counter = 1;

    while (true) {
      const check = await pool.query(
        "SELECT user_id FROM users WHERE LOWER(username) = LOWER($1) AND user_id != $2 LIMIT 1",
        [candidate, u.user_id],
      );
      if (check.rowCount === 0) break;
      candidate = `${base}_${counter}`;
      counter++;
    }

    await pool.query("UPDATE users SET username = $1 WHERE user_id = $2", [candidate, u.user_id]);
    console.log(`Updated user ${u.user_id} (${u.email}) -> username: "${candidate}"`);
  }

  await pool.query(
    "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username)) WHERE username IS NOT NULL",
  );
  console.log("Successfully created unique index on LOWER(username).");
  await closePool();
}

main().catch(async (err) => {
  console.error("Backfill failed:", err);
  await closePool();
  process.exit(1);
});
