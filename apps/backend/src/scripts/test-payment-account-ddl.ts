import { pool } from "../lib/db.js";

async function testDDL() {
  const client = await pool.connect();
  try {
    console.log("Testing DDL statements...");
    await client.query("BEGIN");

    // 1. user_payment_accounts table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_payment_accounts (
        account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
        account_type VARCHAR(20) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        account_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(100) NOT NULL,
        bank_name VARCHAR(255),
        branch_name VARCHAR(255),
        is_default BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Constraints & Indexes
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_payment_account_type') THEN
          ALTER TABLE user_payment_accounts ADD CONSTRAINT chk_payment_account_type CHECK (account_type IN ('mobile_money', 'bank'));
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_payment_account_provider') THEN
          ALTER TABLE user_payment_accounts ADD CONSTRAINT chk_payment_account_provider CHECK (provider IN ('bkash', 'nagad', 'rocket', 'bank'));
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_payment_accounts_user ON user_payment_accounts(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_payment_accounts_user_active ON user_payment_accounts(user_id, is_active);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_user_payment_accounts_default ON user_payment_accounts(user_id) WHERE is_default = TRUE AND is_active = TRUE;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trg_user_payment_accounts_updated_at ON user_payment_accounts;
      CREATE TRIGGER trg_user_payment_accounts_updated_at BEFORE UPDATE ON user_payment_accounts FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
    `);

    // 3. Columns in other tables
    await client.query(`
      ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS disbursement_account_id UUID REFERENCES user_payment_accounts(account_id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS idx_loan_applications_disbursement_account ON loan_applications(disbursement_account_id);

      ALTER TABLE loan_disbursements ADD COLUMN IF NOT EXISTS payment_account_id UUID REFERENCES user_payment_accounts(account_id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS idx_loan_disbursements_payment_account ON loan_disbursements(payment_account_id);

      ALTER TABLE repayments ADD COLUMN IF NOT EXISTS payment_account_id UUID REFERENCES user_payment_accounts(account_id) ON DELETE SET NULL;
      CREATE INDEX IF NOT EXISTS idx_repayments_payment_account ON repayments(payment_account_id);
    `);

    // 4. Update process_repayment procedure
    await client.query(`
      DROP PROCEDURE IF EXISTS process_repayment(
        UUID, DECIMAL, VARCHAR, VARCHAR, VARCHAR, VARCHAR,
        UUID, VARCHAR, UUID, VARCHAR, UUID, DECIMAL, BOOLEAN
      );
    `);

    await client.query(`
      CREATE OR REPLACE PROCEDURE process_repayment(
          p_schedule_id UUID,
          p_amount_paid DECIMAL(12,2),
          p_payment_method VARCHAR(50) DEFAULT NULL,
          p_txn_reference VARCHAR(100) DEFAULT NULL,
          p_provider_ref VARCHAR(100) DEFAULT NULL,
          p_status VARCHAR(20) DEFAULT 'completed',
          INOUT out_repayment_id UUID DEFAULT NULL,
          INOUT out_schedule_status VARCHAR(20) DEFAULT NULL,
          INOUT out_loan_id UUID DEFAULT NULL,
          INOUT out_loan_status VARCHAR(20) DEFAULT NULL,
          INOUT out_user_id UUID DEFAULT NULL,
          INOUT out_total_outstanding DECIMAL(12,2) DEFAULT NULL,
          INOUT out_is_duplicate BOOLEAN DEFAULT FALSE,
          p_payment_account_id UUID DEFAULT NULL
      )
      LANGUAGE plpgsql
      AS $proc$
      DECLARE
          v_schedule repayment_schedules%ROWTYPE;
          v_total_paid DECIMAL(12,2);
          v_outstanding DECIMAL(12,2);
          v_all_paid BOOLEAN;
          v_has_overdue BOOLEAN;
          v_existing_schedule_id UUID;
      BEGIN
          SELECT * INTO v_schedule
          FROM repayment_schedules
          WHERE schedule_id = p_schedule_id
          FOR UPDATE;

          IF NOT FOUND THEN
              RAISE EXCEPTION 'Repayment schedule not found: %', p_schedule_id USING ERRCODE = 'P0002';
          END IF;

          out_loan_id := v_schedule.loan_id;

          -- Holding the schedule row lock makes a provider-reference replay deterministic.
          IF p_provider_ref IS NOT NULL THEN
              SELECT repayment_id, schedule_id INTO out_repayment_id, v_existing_schedule_id
              FROM repayments
              WHERE provider_reference = p_provider_ref;

              IF FOUND THEN
                  IF v_existing_schedule_id <> p_schedule_id THEN
                      RAISE EXCEPTION 'Provider reference belongs to a different repayment schedule' USING ERRCODE = 'P0001';
                  END IF;
                  out_is_duplicate := TRUE;
                  SELECT status INTO out_schedule_status
                  FROM repayment_schedules
                  WHERE schedule_id = p_schedule_id;
                  SELECT status, user_id INTO out_loan_status, out_user_id
                  FROM loans
                  WHERE loan_id = v_schedule.loan_id;
                  SELECT GREATEST(0, ROUND(
                      COALESCE(SUM(rs.expected_amount), 0) - COALESCE((
                          SELECT SUM(r.amount_paid)
                          FROM repayments r
                          JOIN repayment_schedules paid_schedule ON paid_schedule.schedule_id = r.schedule_id
                          WHERE paid_schedule.loan_id = v_schedule.loan_id AND r.status = 'completed'
                      ), 0), 2))
                  INTO out_total_outstanding
                  FROM repayment_schedules rs
                  WHERE rs.loan_id = v_schedule.loan_id;
                  RETURN;
              END IF;
          END IF;

          IF p_amount_paid <= 0 THEN
              RAISE EXCEPTION 'Repayment amount must be positive' USING ERRCODE = 'P0001';
          END IF;

          SELECT COALESCE(SUM(amount_paid), 0) INTO v_total_paid
          FROM repayments
          WHERE schedule_id = p_schedule_id AND status = 'completed';

          v_outstanding := GREATEST(0, ROUND(v_schedule.expected_amount - v_total_paid, 2));
          IF p_status = 'completed' AND ROUND(p_amount_paid, 2) > v_outstanding THEN
              RAISE EXCEPTION 'Repayment amount exceeds the outstanding balance' USING ERRCODE = 'P0001';
          END IF;

          INSERT INTO repayments (
              schedule_id, amount_paid, payment_method, transaction_reference, provider_reference, status, payment_account_id
          ) VALUES (
              p_schedule_id, ROUND(p_amount_paid, 2), p_payment_method, p_txn_reference, p_provider_ref, p_status, p_payment_account_id
          )
          ON CONFLICT (provider_reference) WHERE provider_reference IS NOT NULL DO NOTHING
          RETURNING repayment_id INTO out_repayment_id;

          IF out_repayment_id IS NULL THEN
              -- A concurrent request committed the same provider reference after the check above.
              out_is_duplicate := TRUE;
              SELECT repayment_id, schedule_id INTO out_repayment_id, v_existing_schedule_id
              FROM repayments
              WHERE provider_reference = p_provider_ref;
              IF v_existing_schedule_id <> p_schedule_id THEN
                  RAISE EXCEPTION 'Provider reference belongs to a different repayment schedule' USING ERRCODE = 'P0001';
              END IF;
          END IF;

          SELECT COALESCE(SUM(amount_paid), 0) INTO v_total_paid
          FROM repayments
          WHERE schedule_id = p_schedule_id AND status = 'completed';

          IF p_status = 'completed' AND NOT out_is_duplicate THEN
              v_outstanding := GREATEST(0, ROUND(v_schedule.expected_amount - v_total_paid, 2));
              UPDATE repayment_schedules
              SET status = CASE
                  WHEN v_outstanding <= 0 THEN 'paid'
                  WHEN v_total_paid > 0 THEN 'partially_paid'
                  ELSE status
              END
              WHERE schedule_id = p_schedule_id
              RETURNING status INTO out_schedule_status;
          ELSE
              out_schedule_status := v_schedule.status;
          END IF;

          SELECT user_id INTO out_user_id FROM loans WHERE loan_id = v_schedule.loan_id FOR UPDATE;
          SELECT
              NOT EXISTS (
                  SELECT 1 FROM repayment_schedules
                  WHERE loan_id = v_schedule.loan_id AND status <> 'paid'
              ),
              EXISTS (
                  SELECT 1 FROM repayment_schedules
                  WHERE loan_id = v_schedule.loan_id AND status = 'overdue'
              )
          INTO v_all_paid, v_has_overdue;

          out_loan_status := CASE
              WHEN v_all_paid THEN 'completed'
              WHEN v_has_overdue THEN 'overdue'
              ELSE 'active'
          END;
          UPDATE loans SET status = out_loan_status, updated_at = NOW() WHERE loan_id = v_schedule.loan_id;

          SELECT GREATEST(0, ROUND(
              COALESCE(SUM(rs.expected_amount), 0) - COALESCE((
                  SELECT SUM(r.amount_paid)
                  FROM repayments r
                  JOIN repayment_schedules paid_schedule ON paid_schedule.schedule_id = r.schedule_id
                  WHERE paid_schedule.loan_id = v_schedule.loan_id AND r.status = 'completed'
              ), 0), 2))
          INTO out_total_outstanding
          FROM repayment_schedules rs
          WHERE rs.loan_id = v_schedule.loan_id;
      END;
      $proc$;
    `);

    await client.query("COMMIT");
    console.log("DDL executed successfully!");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("DDL failed:", err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

testDDL();
