import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { pool } from "../../lib/db.js";

describe("PostgreSQL Integrity Layer", () => {
  beforeAll(async () => {
    // Wait for migrations to finish if they haven't already.
    // In a real test environment, a global setup script runs migrations.
  });

  afterAll(async () => {
    await pool.end();
  });

  it("rejects negative requested_amount in loan_applications", async () => {
    const email = `test1-${Date.now()}@example.com`;
    const userIdRes = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, 'hash') RETURNING user_id`,
      [email],
    );
    const userId = userIdRes.rows[0].user_id;

    await expect(
      pool.query(
        `INSERT INTO loan_applications (user_id, requested_amount, purpose) VALUES ($1, -500, 'tuition')`,
        [userId],
      ),
    ).rejects.toThrowError(/chk_loan_app_amount/);

    // cleanup
    await pool.query(`DELETE FROM users WHERE user_id = $1`, [userId]);
  });

  it("rejects invalid status in verification_requests", async () => {
    const email = `test2-${Date.now()}@example.com`;
    const userIdRes = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, 'hash') RETURNING user_id`,
      [email],
    );
    const userId = userIdRes.rows[0].user_id;

    await expect(
      pool.query(
        `INSERT INTO verification_requests (user_id, verification_type, status) VALUES ($1, 'identity', 'invalid_status')`,
        [userId],
      ),
    ).rejects.toThrowError(/chk_verif_req_status/);

    // cleanup
    await pool.query(`DELETE FROM users WHERE user_id = $1`, [userId]);
  });

  it("prevents multiple current trust scores for the same user via unique index", async () => {
    const email = `test3-${Date.now()}@example.com`;
    const userIdRes = await pool.query(
      `INSERT INTO users (email, password_hash) VALUES ($1, 'hash') RETURNING user_id`,
      [email],
    );
    const userId = userIdRes.rows[0].user_id;

    // Insert first current score
    await pool.query(
      `INSERT INTO trust_scores (user_id, score, trust_band, trigger_event, is_current) VALUES ($1, 75, 'low_risk', 'init', TRUE)`,
      [userId],
    );

    // Inserting another current score should fail
    await expect(
      pool.query(
        `INSERT INTO trust_scores (user_id, score, trust_band, trigger_event, is_current) VALUES ($1, 80, 'very_low_risk', 'update', TRUE)`,
        [userId],
      ),
    ).rejects.toThrowError(/idx_trust_scores_user_current/);

    // Inserting a non-current score should succeed
    await pool.query(
      `INSERT INTO trust_scores (user_id, score, trust_band, trigger_event, is_current) VALUES ($1, 80, 'very_low_risk', 'update', FALSE)`,
      [userId],
    );

    // Cannot cleanup because trust_scores is append-only and has a RESTRICT FK.
  });

  it("prevents updates to audit_logs due to append-only trigger", async () => {
    const logRes = await pool.query(
      `INSERT INTO audit_logs (action) VALUES ('test_action') RETURNING log_id`,
    );
    const logId = logRes.rows[0].log_id;

    await expect(
      pool.query(`UPDATE audit_logs SET action = 'modified_action' WHERE log_id = $1`, [logId]),
    ).rejects.toThrowError(/Updates and Deletes are not allowed/);

    // Note: Since deletes are also blocked, we cannot clean this up without disabling the trigger.
    // In a test environment, DB transactions are often rolled back entirely.
  });
});
