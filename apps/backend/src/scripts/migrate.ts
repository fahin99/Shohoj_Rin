import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { PoolClient } from "pg";
import { pool } from "../lib/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaFile = "schema.sql";
const migrationDir = path.resolve(__dirname, "../../migrations");

async function hasCanonicalSchema(client: PoolClient) {
  const { rows } = await client.query(`
    SELECT
      to_regclass('public.users') IS NOT NULL
      AND to_regclass('public.user_profiles') IS NOT NULL
      AND to_regclass('public.verification_requests') IS NOT NULL
      AND to_regclass('public.verification_documents') IS NOT NULL
      AND to_regclass('public.investor_profiles') IS NOT NULL
      AND to_regclass('public.loan_products') IS NOT NULL
      AND to_regclass('public.funding_commitments') IS NOT NULL
      AND to_regclass('public.user_payment_accounts') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'partner_id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'username'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'user_profiles' AND column_name = 'profile_completion_status'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'verification_requests' AND column_name = 'verification_source'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'verification_documents' AND column_name = 'document_status'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'loan_applications' AND column_name = 'product_id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'loan_applications' AND column_name = 'disbursement_account_id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'loan_disbursements' AND column_name = 'payment_account_id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'repayments' AND column_name = 'payment_account_id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'investor_profiles' AND column_name = 'partner_agent_id'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'loans' AND column_name = 'partner_agent_id'
      ) AS complete
  `);

  return Boolean(rows[0].complete);
}

async function ensureAccountIdentitySchema(client: PoolClient) {
  await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50)`);
  await client.query(`ALTER TABLE users ALTER COLUMN username DROP NOT NULL`);
  await client.query(`DROP INDEX IF EXISTS idx_users_username_unique`);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower
    ON users (LOWER(username))
    WHERE username IS NOT NULL
  `);
  await client.query(`ALTER TABLE user_profiles ALTER COLUMN full_name DROP NOT NULL`);
  await client.query(`
    ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS employment_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS employer_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS monthly_income DECIMAL(12,2),
      ADD COLUMN IF NOT EXISTS monthly_savings DECIMAL(12,2),
      ADD COLUMN IF NOT EXISTS income_source VARCHAR(100),
      ADD COLUMN IF NOT EXISTS profile_completion_status VARCHAR(30) NOT NULL DEFAULT 'incomplete'
  `);
}

async function ensureApplicationDurationSchema(client: PoolClient) {
  await client.query(`
    ALTER TABLE loan_applications
      ADD COLUMN IF NOT EXISTS duration_months INTEGER NOT NULL DEFAULT 12
  `);
  await client.query(`
    UPDATE loan_applications la
    SET duration_months = lp.duration_months
    FROM loan_products lp
    WHERE la.product_id = lp.product_id
      AND la.duration_months = 12
      AND lp.duration_months <> 12
  `);
}

async function ensureRepaymentProcedure(client: PoolClient) {
  const schema = await fs.readFile(path.join(migrationDir, schemaFile), "utf8");
  const procedureStart = schema.indexOf("CREATE OR REPLACE PROCEDURE process_repayment(");
  const nextProcedureStart = schema.indexOf(
    "CREATE OR REPLACE PROCEDURE generate_repayment_schedule(",
    procedureStart,
  );
  if (procedureStart === -1 || nextProcedureStart === -1) {
    throw new Error("Unable to locate process_repayment in schema.sql");
  }
  await client.query(schema.slice(procedureStart, nextProcedureStart));
}

async function listMigrationFiles() {
  const entries = await fs.readdir(migrationDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort();
}

async function ensureFundingCommitments(client: PoolClient) {
  const tableExists = await client.query(
    `SELECT to_regclass('public.funding_commitments') AS table_name`,
  );
  if (tableExists.rows[0].table_name) return;

  console.log(
    "Canonical schema is missing funding_commitments; repairing it from schema.sql definition...",
  );
  await client.query(`
    CREATE TABLE funding_commitments (
      commitment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID NOT NULL REFERENCES loan_applications (application_id) ON DELETE RESTRICT,
      lender_user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
      amount DECIMAL(12,2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'committed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (application_id, lender_user_id)
    );
  `);
  await client.query(`
    ALTER TABLE funding_commitments
      ADD CONSTRAINT chk_funding_commitments_status CHECK (status IN ('committed', 'cancelled')),
      ADD CONSTRAINT chk_funding_commitments_amount CHECK (amount > 0);
  `);
  await client.query(`
    CREATE INDEX idx_funding_commitments_lender
      ON funding_commitments(lender_user_id, status, created_at DESC);
    CREATE INDEX idx_funding_commitments_application
      ON funding_commitments(application_id, status);
  `);
}

async function ensureLenderMarketplaceSchema(client: PoolClient) {
  await client.query(`
    ALTER TABLE funding_partners
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS branch VARCHAR(255),
      ADD COLUMN IF NOT EXISTS goal VARCHAR(255);
  `);

  const tableExists = await client.query(
    `SELECT to_regclass('public.lender_application_matches') AS table_name`,
  );
  if (tableExists.rows[0].table_name) return;

  console.log("Canonical schema is missing lender_application_matches; creating it...");
  await client.query(`
    CREATE TABLE lender_application_matches (
      match_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id UUID NOT NULL REFERENCES loan_applications (application_id) ON DELETE CASCADE,
      lender_user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
      priority INTEGER NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      matched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      viewed_at TIMESTAMPTZ,
      decided_at TIMESTAMPTZ,
      decision_reason TEXT,
      UNIQUE (application_id, lender_user_id)
    );
  `);
  await client.query(`
    ALTER TABLE lender_application_matches
      ADD CONSTRAINT chk_lender_match_status CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected', 'expired'));
  `);
  await client.query(`
    CREATE INDEX idx_lender_matches_lender ON lender_application_matches(lender_user_id, status, matched_at DESC);
    CREATE INDEX idx_lender_matches_application ON lender_application_matches(application_id, priority ASC);
  `);
}

/**
 * Race-safe company creation (item 3): funding_partners.name is only exact-match
 * UNIQUE, so pre-existing databases may already contain rows that differ only by
 * case/whitespace (e.g. "ABC Bank" and " abc bank "). Merge any such duplicates into
 * a single canonical row (the earliest-created one) before installing the normalized
 * unique index the application now relies on for its ON CONFLICT upsert.
 */
async function ensureFundingPartnerNameNormalizedIndex(client: PoolClient) {
  const indexExists = await client.query(
    `SELECT to_regclass('public.idx_funding_partners_name_normalized') AS index_name`,
  );
  if (indexExists.rows[0].index_name) return;

  console.log("Deduplicating funding_partners by normalized name before adding unique index...");
  await client.query(`
    DO $$
    DECLARE
      dup RECORD;
    BEGIN
      FOR dup IN
        SELECT array_agg(partner_id ORDER BY created_at, partner_id) AS ids
        FROM funding_partners
        GROUP BY lower(regexp_replace(btrim(name), '\\s+', ' ', 'g'))
        HAVING COUNT(*) > 1
      LOOP
        UPDATE users SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE loan_products SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE loan_applications SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE loan_offers SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE loans SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE partner_rules SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        UPDATE partner_decisions SET partner_id = dup.ids[1] WHERE partner_id = ANY(dup.ids[2:]);
        DELETE FROM funding_partners WHERE partner_id = ANY(dup.ids[2:]);
      END LOOP;
    END $$;
  `);

  console.log("Creating idx_funding_partners_name_normalized...");
  await client.query(`
    CREATE UNIQUE INDEX idx_funding_partners_name_normalized
      ON funding_partners (lower(regexp_replace(btrim(name), '\\s+', ' ', 'g')));
  `);
}

/**
 * Lender → investor_profiles invariant (item 4): install the trigger that guarantees
 * every users row with role = 'lender' has a matching investor_profiles row, then
 * backfill any pre-existing lender accounts that predate the trigger.
 */
async function ensureLenderInvestorProfileInvariant(client: PoolClient) {
  const tableExists = await client.query(
    `SELECT to_regclass('public.investor_profiles') AS table_name`,
  );
  if (!tableExists.rows[0].table_name) return;

  await client.query(`
    CREATE OR REPLACE FUNCTION ensure_lender_investor_profile()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.role = 'lender' THEN
            INSERT INTO investor_profiles (user_id, verification_status, kyc_status, account_status)
            VALUES (NEW.user_id, 'pending', 'incomplete', 'active')
            ON CONFLICT (user_id) DO NOTHING;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await client.query(`DROP TRIGGER IF EXISTS trg_users_ensure_lender_investor_profile ON users;`);
  await client.query(`
    CREATE TRIGGER trg_users_ensure_lender_investor_profile
      AFTER INSERT OR UPDATE OF role ON users
      FOR EACH ROW EXECUTE PROCEDURE ensure_lender_investor_profile();
  `);

  const backfill = await client.query(`
    INSERT INTO investor_profiles (user_id, verification_status, kyc_status, account_status)
    SELECT user_id, 'pending', 'incomplete', 'active'
    FROM users
    WHERE role = 'lender'
    ON CONFLICT (user_id) DO NOTHING
    RETURNING user_id;
  `);
  if (backfill.rowCount && backfill.rowCount > 0) {
    console.log(
      `Backfilled investor_profiles for ${backfill.rowCount} pre-existing lender account(s).`,
    );
  }
}

async function ensureLoanApplicationReference(client: PoolClient) {
  const columnExists = await client.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'loan_applications' AND column_name = 'reference_code'
  `);
  if (!columnExists.rowCount) {
    console.log("Adding reference_code to loan_applications...");
    await client.query(`CREATE SEQUENCE IF NOT EXISTS loan_application_ref_seq START 1`);
    await client.query(`ALTER TABLE loan_applications ADD COLUMN reference_code VARCHAR(20)`);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_applications_reference_code
      ON loan_applications (reference_code) WHERE reference_code IS NOT NULL
    `);
  }

  await client.query(`
    CREATE OR REPLACE FUNCTION generate_loan_application_reference()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.reference_code IS NULL THEN
        NEW.reference_code := 'SR-' || to_char(NOW(), 'YYYY') || '-' ||
          lpad(nextval('loan_application_ref_seq')::text, 5, '0');
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  await client.query(`DROP TRIGGER IF EXISTS trg_loan_applications_reference ON loan_applications`);
  await client.query(`
    CREATE TRIGGER trg_loan_applications_reference
      BEFORE INSERT ON loan_applications
      FOR EACH ROW EXECUTE PROCEDURE generate_loan_application_reference();
  `);

  const backfilled = await client.query(`
    UPDATE loan_applications
    SET reference_code = 'SR-' || to_char(created_at, 'YYYY') || '-' ||
      lpad(nextval('loan_application_ref_seq')::text, 5, '0')
    WHERE reference_code IS NULL
    RETURNING application_id
  `);
  if (backfilled.rowCount && backfilled.rowCount > 0) {
    console.log(`Backfilled reference_code for ${backfilled.rowCount} existing application(s).`);
  }
}

async function ensureBorrowerTrustSummaryView(client: PoolClient) {
  await client.query(`
    CREATE OR REPLACE VIEW borrower_trust_summary AS
    SELECT
      u.user_id,
      up.full_name,
      ts.score,
      ts.trust_band,
      ts.confidence_score,
      ts.trigger_event,
      ts.calculated_at,
      NOT EXISTS (SELECT 1 FROM loans l WHERE l.user_id = u.user_id) AS is_first_time_borrower,
      COALESCE((
        SELECT json_agg(json_build_object(
          'name', tsf.factor_name,
          'score', tsf.factor_value,
          'weight', tsf.factor_weight,
          'description', tsf.description
        ) ORDER BY tsf.factor_name)
        FROM trust_score_factors tsf
        WHERE tsf.score_id = ts.score_id
      ), '[]'::json) AS factors
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.user_id
    LEFT JOIN trust_scores ts ON ts.user_id = u.user_id AND ts.is_current = TRUE
    WHERE u.role = 'borrower';
  `);
}

async function ensureDatabaseComputedFunctions(client: PoolClient) {
  // Keep the existing trust-score input function available for databases that were
  // baselined before it was added to schema.sql.
  await client.query(`
    CREATE OR REPLACE FUNCTION get_trust_inputs(p_user_id UUID)
    RETURNS JSON
    LANGUAGE sql
    STABLE
    AS $func$
      WITH repayment_data AS (
        SELECT
          COUNT(*) FILTER (WHERE rs.due_date <= CURRENT_DATE) AS total_due,
          COUNT(*) FILTER (WHERE rs.status = 'paid' AND completed.paid_at <= rs.due_date) AS on_time,
          COUNT(*) FILTER (WHERE rs.status = 'paid' AND (completed.paid_at IS NULL OR completed.paid_at > rs.due_date)) AS late,
          COUNT(*) FILTER (WHERE rs.status IN ('pending', 'overdue') AND rs.due_date < CURRENT_DATE) AS missed,
          COUNT(*) FILTER (WHERE rs.status = 'defaulted') AS defaults,
          COUNT(*) FILTER (WHERE rs.status = 'paid') AS total_repayments
        FROM loans l
        JOIN repayment_schedules rs ON rs.loan_id = l.loan_id
        LEFT JOIN LATERAL (
          SELECT MAX(paid_at) AS paid_at
          FROM repayments r
          WHERE r.schedule_id = rs.schedule_id AND r.status = 'completed'
        ) completed ON TRUE
        WHERE l.user_id = p_user_id
      ),
      financial_data AS (
        SELECT monthly_family_income FROM user_profiles WHERE user_id = p_user_id
      ),
      obligation_data AS (
        SELECT COUNT(DISTINCT l.loan_id) AS active_loans, COALESCE(SUM(rs.expected_amount), 0) AS monthly_obligations
        FROM loans l
        JOIN repayment_schedules rs ON rs.loan_id = l.loan_id
        WHERE l.user_id = p_user_id AND l.status = 'active'
          AND rs.status IN ('pending', 'overdue')
          AND rs.due_date >= DATE_TRUNC('month', CURRENT_DATE)
          AND rs.due_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      ),
      verification_data AS (
        SELECT COALESCE(array_agg(verification_type), '{}') AS types, COUNT(*) AS count
        FROM verification_requests WHERE user_id = p_user_id AND status = 'approved'
      )
      SELECT json_build_object(
        'repayment', json_build_object(
          'totalDuePayments', COALESCE(rd.total_due, 0), 'onTimePayments', COALESCE(rd.on_time, 0),
          'latePayments', COALESCE(rd.late, 0), 'missedPayments', COALESCE(rd.missed, 0), 'defaults', COALESCE(rd.defaults, 0)),
        'financial', json_build_object(
          'monthlyIncome', fd.monthly_family_income, 'monthlyDebtObligations', COALESCE(od.monthly_obligations, 0),
          'activeLoanCount', COALESCE(od.active_loans, 0)),
        'behavior', json_build_object('hasTransactionData', false),
        'verification', json_build_object(
          'identityVerified', 'identity' = ANY(vd.types), 'phoneVerified', u.phone IS NOT NULL,
          'emailVerified', u.email_verified, 'addressVerified', 'address' = ANY(vd.types),
          'incomeVerified', 'income' = ANY(vd.types), 'studentVerified', 'student' = ANY(vd.types)),
        'credit', json_build_object('activeLoanCount', COALESCE(od.active_loans, 0), 'recentApplications', COALESCE(app.recent_apps, 0)),
        'tenure', json_build_object(
          'accountAgeDays', GREATEST(0, EXTRACT(DAY FROM NOW() - u.created_at)::INT),
          'totalRepaymentCount', COALESCE(rd.total_repayments, 0), 'verificationCount', COALESCE(vd.count, 0))
      )
      FROM users u
      LEFT JOIN repayment_data rd ON TRUE
      LEFT JOIN financial_data fd ON TRUE
      LEFT JOIN obligation_data od ON TRUE
      LEFT JOIN verification_data vd ON TRUE
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS recent_apps FROM loan_applications
        WHERE user_id = p_user_id AND created_at >= NOW() - INTERVAL '90 days'
      ) app ON TRUE
      WHERE u.user_id = p_user_id;
    $func$;
  `);

  await client.query(`
    CREATE OR REPLACE FUNCTION calculate_loan_remaining_balance(p_loan_id UUID)
    RETURNS NUMERIC(12,2)
    LANGUAGE sql
    STABLE
    AS $func$
      WITH selected_loan AS (
        SELECT principal_amount FROM loans WHERE loan_id = p_loan_id
      ),
      expected_total AS (
        SELECT COALESCE(SUM(expected_amount), 0::numeric) AS amount
        FROM repayment_schedules
        WHERE loan_id = p_loan_id
      ),
      paid_total AS (
        SELECT COALESCE(SUM(repayment.amount_paid), 0::numeric) AS amount
        FROM repayments repayment
        JOIN repayment_schedules schedule ON schedule.schedule_id = repayment.schedule_id
        WHERE schedule.loan_id = p_loan_id
          AND repayment.status = 'completed'
      )
      SELECT COALESCE(
        GREATEST(
          0::numeric,
          CASE
            WHEN EXISTS (SELECT 1 FROM repayment_schedules WHERE loan_id = p_loan_id)
              THEN (SELECT amount FROM expected_total)
            ELSE (SELECT principal_amount FROM selected_loan)
          END - (SELECT amount FROM paid_total)
        ),
        0::numeric
      )::NUMERIC(12,2);
    $func$;
  `);
}

async function ensurePaymentAccountsSchema(client: PoolClient) {
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

  await client.query(`
    ALTER TABLE loan_applications ADD COLUMN IF NOT EXISTS disbursement_account_id UUID REFERENCES user_payment_accounts(account_id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_loan_applications_disbursement_account ON loan_applications(disbursement_account_id);

    ALTER TABLE loan_disbursements ADD COLUMN IF NOT EXISTS payment_account_id UUID REFERENCES user_payment_accounts(account_id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_loan_disbursements_payment_account ON loan_disbursements(payment_account_id);

    ALTER TABLE repayments ADD COLUMN IF NOT EXISTS payment_account_id UUID REFERENCES user_payment_accounts(account_id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_repayments_payment_account ON repayments(payment_account_id);
  `);
}

async function ensurePartnerAgentSchema(client: PoolClient) {
  await client.query(`
    ALTER TABLE investor_profiles
      ADD COLUMN IF NOT EXISTS partner_agent_id UUID REFERENCES users (user_id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_investor_profiles_partner_agent
      ON investor_profiles (partner_agent_id);

    ALTER TABLE loans
      ADD COLUMN IF NOT EXISTS partner_agent_id UUID REFERENCES users (user_id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_loans_partner_agent
      ON loans (partner_agent_id);
  `);
}

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await ensurePartnerAgentSchema(client);

    const { rows } = await client.query("SELECT name FROM migrations");
    const executedMigrations = new Set(rows.map((r) => r.name));
    const schemaComplete = await hasCanonicalSchema(client);

    if (schemaComplete) {
      if (!executedMigrations.has(schemaFile)) {
        console.log("Existing canonical database detected. Baselining schema.sql...");
        await client.query(
          "INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
          [schemaFile],
        );
      }

      // schema.sql is the only SQL migration file by design.
      const pendingFiles = (await listMigrationFiles()).filter(
        (file) => file !== schemaFile && !file.startsWith("2026_08_31_fix_funding_commitments"),
      );
      for (const migrationName of pendingFiles) {
        throw new Error(
          `Unexpected SQL migration file found: ${migrationName}. Keep schema.sql as the sole canonical SQL file.`,
        );
      }

      await ensureLenderMarketplaceSchema(client);
      await ensureFundingPartnerNameNormalizedIndex(client);
      await ensureLenderInvestorProfileInvariant(client);
      await ensureApplicationDurationSchema(client);
      await ensureRepaymentProcedure(client);
      await ensureLoanApplicationReference(client);
      await ensureBorrowerTrustSummaryView(client);
      await ensureDatabaseComputedFunctions(client);
      await ensurePaymentAccountsSchema(client);

      console.log("Canonical schema is already installed.");
      return;
    }

    const existingSchemaCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'users'
      ) AS exists;
    `);

    if (existingSchemaCheck.rows[0].exists) {
      await ensureAccountIdentitySchema(client);
      await ensureFundingCommitments(client);
      await ensureApplicationDurationSchema(client);
      await ensureRepaymentProcedure(client);
      await ensureLenderMarketplaceSchema(client);
      await ensureFundingPartnerNameNormalizedIndex(client);
      await ensureLenderInvestorProfileInvariant(client);
      await ensureLoanApplicationReference(client);
      await ensureBorrowerTrustSummaryView(client);
      await ensureDatabaseComputedFunctions(client);
      await ensurePaymentAccountsSchema(client);

      const schemaStillIncomplete = !(await hasCanonicalSchema(client));
      if (schemaStillIncomplete) {
        throw new Error(
          "The existing database is missing required canonical schema fields. Recreate the development database and rerun migrate.",
        );
      }

      if (!executedMigrations.has(schemaFile)) {
        await client.query(
          "INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
          [schemaFile],
        );
      }

      console.log("Applied compatible canonical-schema repair to the existing database.");
      return;
    }

    console.log(`Executing migration: ${schemaFile}`);
    const filePath = path.resolve(migrationDir, schemaFile);
    const sql = await fs.readFile(filePath, "utf-8");

    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query(
        "INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
        [schemaFile],
      );
      await client.query("COMMIT");
      console.log(`Migration ${schemaFile} completed successfully.`);
    } catch (error) {
      await client.query("ROLLBACK");
      console.error(`Error executing migration ${schemaFile}:`, error);
      throw error;
    }

    await ensureLenderMarketplaceSchema(client);
    await ensureFundingPartnerNameNormalizedIndex(client);
    await ensureLenderInvestorProfileInvariant(client);
    await ensureLoanApplicationReference(client);
    await ensureBorrowerTrustSummaryView(client);
    await ensureDatabaseComputedFunctions(client);
    await ensurePaymentAccountsSchema(client);

    console.log("Canonical schema installed successfully.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
