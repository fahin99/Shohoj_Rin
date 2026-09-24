CREATE EXTENSION IF NOT EXISTS pgcrypto;
 
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'borrower',
  account_status VARCHAR(20) NOT NULL DEFAULT 'active',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE login_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE institutions (
  institution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  address TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE user_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  nid_number VARCHAR(50) UNIQUE,
  address_line TEXT,
  city VARCHAR(100),
  district VARCHAR(100),
  postal_code VARCHAR(20),
  occupation VARCHAR(100),
  monthly_family_income DECIMAL(12,2),
  institution_id UUID REFERENCES institutions (institution_id) ON DELETE SET NULL,
  student_id VARCHAR(100),
  enrollment_year INTEGER,
  profile_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE verification_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reviewer_id UUID REFERENCES users (user_id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
 
CREATE TABLE verification_documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES verification_requests (request_id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  mime_type VARCHAR(100),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE guarantors (
  guarantor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  relationship VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  nid_number VARCHAR(50),
  address TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE trust_scores (
  score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
  score DECIMAL(5,2) NOT NULL,
  trust_band VARCHAR(20) NOT NULL,
  confidence_score DECIMAL(5,2),
  trigger_event VARCHAR(100) NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE trust_score_factors (
  factor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_id UUID NOT NULL REFERENCES trust_scores (score_id) ON DELETE RESTRICT,
  factor_name VARCHAR(100) NOT NULL,
  factor_value DECIMAL(6,2) NOT NULL,
  factor_weight DECIMAL(3,2),
  description TEXT
);
 
CREATE TABLE funding_partners (
  partner_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE loan_applications (
  application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  partner_id UUID REFERENCES funding_partners (partner_id) ON DELETE SET NULL,
  requested_amount DECIMAL(12,2) NOT NULL,
  purpose VARCHAR(100) NOT NULL,
  purpose_description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  trust_score_id UUID REFERENCES trust_scores (score_id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE loan_offers (
  offer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID UNIQUE NOT NULL REFERENCES loan_applications (application_id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES funding_partners (partner_id) ON DELETE RESTRICT,
  offered_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  tenure_months INTEGER NOT NULL,
  conditions TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  offered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ
);
 
CREATE TABLE loans (
  loan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID UNIQUE NOT NULL REFERENCES loan_applications (application_id) ON DELETE RESTRICT,
  offer_id UUID UNIQUE NOT NULL REFERENCES loan_offers (offer_id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
  partner_id UUID NOT NULL REFERENCES funding_partners (partner_id) ON DELETE RESTRICT,
  principal_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  tenure_months INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  expected_end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE loan_disbursements (
  disbursement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans (loan_id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  disbursement_method VARCHAR(50),
  reference_number VARCHAR(100),
  disbursed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE repayment_schedules (
  schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans (loan_id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  expected_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (loan_id, installment_number)
);

CREATE TABLE repayments (
  repayment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES repayment_schedules (schedule_id) ON DELETE RESTRICT,
  amount_paid DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_reference VARCHAR(100),
  provider_reference VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE partner_rules (
  rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES funding_partners (partner_id) ON DELETE CASCADE,
  min_trust_score DECIMAL(5,2),
  max_loan_amount DECIMAL(12,2),
  max_tenure_months INTEGER,
  eligible_purposes TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE partner_decisions (
  decision_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications (application_id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES funding_partners (partner_id) ON DELETE RESTRICT,
  decision VARCHAR(20) NOT NULL,
  reason TEXT,
  decided_by UUID REFERENCES users (user_id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE fraud_flags (
  flag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  flag_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  reviewed_by UUID REFERENCES users (user_id) ON DELETE SET NULL,
  resolution_notes TEXT,
  flagged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
 
CREATE TABLE audit_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users (user_id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  before_state JSONB,
  after_state JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE notifications (
  notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  channel VARCHAR(20) NOT NULL,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  retry_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE INDEX idx_institutions_name ON institutions(name);
CREATE INDEX idx_institutions_type ON institutions(type);
CREATE UNIQUE INDEX idx_trust_scores_user_current ON trust_scores(user_id) WHERE is_current = TRUE;
CREATE UNIQUE INDEX idx_repayments_provider_ref ON repayments(provider_reference) WHERE provider_reference IS NOT NULL;
ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('borrower', 'admin', 'partner_agent'));
ALTER TABLE users ADD CONSTRAINT chk_users_account_status CHECK (account_status IN ('active', 'suspended', 'deactivated'));
 
ALTER TABLE verification_requests ADD CONSTRAINT chk_verif_req_status CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review'));
ALTER TABLE verification_documents ADD CONSTRAINT chk_verif_doc_type CHECK (document_type IN ('nid', 'student_id', 'tuition_receipt', 'utility_bill', 'income_proof', 'other'));
 
ALTER TABLE trust_scores ADD CONSTRAINT chk_trust_scores_band CHECK (trust_band IN ('very_low_risk', 'low_risk', 'moderate_risk', 'high_risk', 'very_high_risk'));
 
ALTER TABLE loan_applications ADD CONSTRAINT chk_loan_app_status CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'disbursed', 'active', 'completed', 'overdue', 'defaulted'));
ALTER TABLE loan_offers ADD CONSTRAINT chk_loan_offer_status CHECK (status IN ('pending', 'accepted', 'declined', 'expired'));
ALTER TABLE loans ADD CONSTRAINT chk_loans_status CHECK (status IN ('active', 'completed', 'overdue', 'delinquent', 'defaulted'));
 
ALTER TABLE repayment_schedules ADD CONSTRAINT chk_repayment_schedule_status CHECK (status IN ('pending', 'paid', 'partially_paid', 'overdue', 'defaulted'));
ALTER TABLE repayments ADD CONSTRAINT chk_repayments_status CHECK (status IN ('completed', 'failed', 'reversed'));
 
ALTER TABLE partner_decisions ADD CONSTRAINT chk_partner_decisions_decision CHECK (decision IN ('approved', 'rejected', 'manual_review'));
 
ALTER TABLE fraud_flags ADD CONSTRAINT chk_fraud_flags_status CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed'));
ALTER TABLE fraud_flags ADD CONSTRAINT chk_fraud_flags_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'));
 
ALTER TABLE notifications ADD CONSTRAINT chk_notifications_delivery_status CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed'));
ALTER TABLE loan_applications ADD CONSTRAINT chk_loan_app_amount CHECK (requested_amount > 0);
ALTER TABLE loan_offers ADD CONSTRAINT chk_loan_offer_amount CHECK (offered_amount > 0);
ALTER TABLE loan_offers ADD CONSTRAINT chk_loan_offer_rate CHECK (interest_rate >= 0);
ALTER TABLE loan_offers ADD CONSTRAINT chk_loan_offer_tenure CHECK (tenure_months > 0);
ALTER TABLE loans ADD CONSTRAINT chk_loans_amount CHECK (principal_amount > 0);
ALTER TABLE loans ADD CONSTRAINT chk_loans_rate CHECK (interest_rate >= 0);
ALTER TABLE loans ADD CONSTRAINT chk_loans_tenure CHECK (tenure_months > 0);
ALTER TABLE loan_disbursements ADD CONSTRAINT chk_disbursement_amount CHECK (amount > 0);
ALTER TABLE repayment_schedules ADD CONSTRAINT chk_repayment_schedule_amount CHECK (expected_amount >= 0);
ALTER TABLE repayments ADD CONSTRAINT chk_repayment_amount CHECK (amount_paid >= 0);
 
ALTER TABLE trust_scores ADD CONSTRAINT chk_trust_scores_score CHECK (score >= 0 AND score <= 100);
ALTER TABLE trust_scores ADD CONSTRAINT chk_trust_scores_confidence CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 100));
ALTER TABLE trust_score_factors ADD CONSTRAINT chk_trust_factors_value CHECK (factor_value >= 0 AND factor_value <= 100);
ALTER TABLE trust_score_factors ADD CONSTRAINT chk_trust_factors_weight CHECK (factor_weight IS NULL OR (factor_weight >= 0 AND factor_weight <= 1.00));
 
ALTER TABLE notifications ADD CONSTRAINT chk_notifications_retry CHECK (retry_count >= 0);
ALTER TABLE loans ADD CONSTRAINT chk_loans_dates CHECK (expected_end_date >= start_date);
ALTER TABLE partner_rules ADD CONSTRAINT chk_partner_rules_dates CHECK (effective_until IS NULL OR effective_until >= effective_from);
ALTER TABLE verification_requests ADD CONSTRAINT chk_verif_req_dates CHECK (reviewed_at IS NULL OR reviewed_at >= submitted_at);
ALTER TABLE fraud_flags ADD CONSTRAINT chk_fraud_flags_dates CHECK (resolved_at IS NULL OR resolved_at >= flagged_at);
 
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE OR REPLACE FUNCTION prevent_update_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Updates and Deletes are not allowed on this table';
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION restrict_trust_scores_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.score != OLD.score OR NEW.trust_band != OLD.trust_band OR NEW.user_id != OLD.user_id THEN
        RAISE EXCEPTION 'Only is_current can be updated on trust_scores';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE process_repayment(
    p_schedule_id       UUID,
    p_amount_paid       DECIMAL(12,2),
    p_payment_method    VARCHAR(50)    DEFAULT NULL,
    p_txn_reference     VARCHAR(100)   DEFAULT NULL,
    p_provider_ref      VARCHAR(100)   DEFAULT NULL,
    p_status            VARCHAR(20)    DEFAULT 'completed',
    INOUT out_repayment_id    UUID           DEFAULT NULL,
    INOUT out_schedule_status VARCHAR(20)    DEFAULT NULL,
    INOUT out_loan_id         UUID           DEFAULT NULL,
    INOUT out_loan_status     VARCHAR(20)    DEFAULT NULL,
    INOUT out_user_id         UUID           DEFAULT NULL,
    INOUT out_total_outstanding DECIMAL(12,2) DEFAULT NULL,
    INOUT out_is_duplicate    BOOLEAN        DEFAULT FALSE
)
LANGUAGE plpgsql
AS $proc$
DECLARE
    v_schedule       repayment_schedules%ROWTYPE;
    v_expected       DECIMAL(12,2);
    v_total_paid     DECIMAL(12,2);
    v_outstanding    DECIMAL(12,2);
    v_next_status    VARCHAR(20);
    v_loan_user_id   UUID;
    v_all_paid       BOOLEAN;
    v_has_overdue    BOOLEAN;
BEGIN
    SELECT * INTO v_schedule
    FROM repayment_schedules
    WHERE schedule_id = p_schedule_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Repayment schedule not found: %', p_schedule_id
            USING ERRCODE = 'P0002';
    END IF;

    out_loan_id := v_schedule.loan_id;
    v_expected  := v_schedule.expected_amount;

    INSERT INTO repayments (
        schedule_id, amount_paid, payment_method,
        transaction_reference, provider_reference, status
    )
    VALUES (
        p_schedule_id, ROUND(p_amount_paid, 2), p_payment_method,
        p_txn_reference, p_provider_ref, p_status
    )
    ON CONFLICT (provider_reference) WHERE provider_reference IS NOT NULL
    DO NOTHING
    RETURNING repayment_id INTO out_repayment_id;

    IF out_repayment_id IS NULL AND p_provider_ref IS NOT NULL THEN
        out_is_duplicate := TRUE;

        SELECT repayment_id INTO out_repayment_id
        FROM repayments WHERE provider_reference = p_provider_ref;

        SELECT status INTO out_schedule_status
        FROM repayment_schedules WHERE schedule_id = p_schedule_id;

        SELECT l.status, l.user_id INTO out_loan_status, out_user_id
        FROM loans l WHERE l.loan_id = v_schedule.loan_id;

        SELECT GREATEST(0, ROUND(
            SUM(rs.expected_amount) - COALESCE((
                SELECT SUM(r.amount_paid)
                FROM repayments r
                WHERE r.schedule_id = rs.schedule_id AND r.status = 'completed'
            ), 0), 2))
        INTO out_total_outstanding
        FROM repayment_schedules rs
        WHERE rs.loan_id = v_schedule.loan_id;

        RETURN;
    END IF;

    SELECT COALESCE(SUM(amount_paid), 0) INTO v_total_paid
    FROM repayments
    WHERE schedule_id = p_schedule_id AND status = 'completed';

    v_outstanding := GREATEST(0, ROUND(v_expected - v_total_paid, 2));

    v_next_status := CASE
        WHEN v_outstanding <= 0 THEN 'paid'
        WHEN v_total_paid > 0  THEN 'partially_paid'
        ELSE v_schedule.status
    END;

    UPDATE repayment_schedules
    SET status = v_next_status
    WHERE schedule_id = p_schedule_id;

    out_schedule_status := v_next_status;

    SELECT user_id INTO v_loan_user_id
    FROM loans WHERE loan_id = v_schedule.loan_id FOR UPDATE;

    out_user_id := v_loan_user_id;

    SELECT
        NOT EXISTS (SELECT 1 FROM repayment_schedules WHERE loan_id = v_schedule.loan_id AND status != 'paid'),
        EXISTS (SELECT 1 FROM repayment_schedules WHERE loan_id = v_schedule.loan_id AND status = 'overdue')
    INTO v_all_paid, v_has_overdue;

    out_loan_status := CASE
        WHEN v_all_paid  THEN 'completed'
        WHEN v_has_overdue THEN 'overdue'
        ELSE 'active'
    END;

    UPDATE loans
    SET status = out_loan_status, updated_at = NOW()
    WHERE loan_id = v_schedule.loan_id;

    SELECT GREATEST(0, ROUND(
        SUM(rs.expected_amount) - COALESCE((
            SELECT SUM(r.amount_paid)
            FROM repayments r
            WHERE r.schedule_id = rs.schedule_id AND r.status = 'completed'
        ), 0), 2))
    INTO out_total_outstanding
    FROM repayment_schedules rs
    WHERE rs.loan_id = v_schedule.loan_id;
END;
$proc$;

CREATE OR REPLACE PROCEDURE generate_repayment_schedule(
    p_loan_id       UUID,
    p_principal      DECIMAL(12,2),
    p_annual_rate    DECIMAL(5,2),
    p_tenure_months  INTEGER,
    p_start_date     DATE DEFAULT CURRENT_DATE
)
LANGUAGE plpgsql
AS $proc$
DECLARE
    v_monthly_rate  DECIMAL(10,8);
    v_emi           DECIMAL(12,2);
    v_balance       DECIMAL(12,2);
    v_interest      DECIMAL(12,2);
    v_principal_part DECIMAL(12,2);
    v_due_date      DATE;
    i               INTEGER;
BEGIN
    v_monthly_rate := p_annual_rate / 100.0 / 12.0;
    v_balance      := p_principal;

    IF v_monthly_rate = 0 THEN
        v_emi := ROUND(p_principal / p_tenure_months, 2);
    ELSE
        v_emi := ROUND(
            p_principal * v_monthly_rate * POWER(1 + v_monthly_rate, p_tenure_months)
            / (POWER(1 + v_monthly_rate, p_tenure_months) - 1),
            2
        );
    END IF;

    FOR i IN 1..p_tenure_months LOOP
        v_interest       := ROUND(v_balance * v_monthly_rate, 2);
        v_principal_part := v_emi - v_interest;
        v_balance        := GREATEST(0, v_balance - v_principal_part);
        v_due_date       := p_start_date + (i || ' months')::INTERVAL;

        INSERT INTO repayment_schedules (
            loan_id, installment_number, due_date, expected_amount, status
        )
        VALUES (
            p_loan_id, i, v_due_date, v_emi, 'pending'
        );
    END LOOP;
END;
$proc$;

CREATE OR REPLACE PROCEDURE mark_overdue_schedules()
LANGUAGE plpgsql
AS $proc$
DECLARE
    v_loan_id UUID;
BEGIN
    UPDATE repayment_schedules
    SET status = 'overdue'
    WHERE status IN ('pending', 'partially_paid')
      AND due_date < CURRENT_DATE;

    FOR v_loan_id IN
        SELECT DISTINCT rs.loan_id
        FROM repayment_schedules rs
        JOIN loans l ON l.loan_id = rs.loan_id
        WHERE rs.status = 'overdue'
          AND l.status = 'active'
    LOOP
        UPDATE loans
        SET status = 'overdue', updated_at = NOW()
        WHERE loan_id = v_loan_id;

        INSERT INTO audit_logs (action, entity_type, entity_id, after_state)
        VALUES (
            'loan_overdue_auto',
            'loan',
            v_loan_id,
            jsonb_build_object('status', 'overdue', 'marked_at', NOW())
        );
    END LOOP;
END;
$proc$;

CREATE OR REPLACE FUNCTION get_trust_inputs(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql STABLE
AS $func$
DECLARE
    v_result JSON;
BEGIN
    WITH repayment_data AS (
        SELECT
            COUNT(*) FILTER (WHERE rs.due_date <= NOW()) AS total_due,
            COUNT(*) FILTER (WHERE rs.status = 'paid' AND r.paid_at <= rs.due_date) AS on_time,
            COUNT(*) FILTER (WHERE rs.status = 'paid' AND (r.paid_at IS NULL OR r.paid_at > rs.due_date)) AS late,
            COUNT(*) FILTER (WHERE rs.status IN ('pending','overdue') AND rs.due_date < NOW()) AS missed,
            COUNT(*) FILTER (WHERE rs.status = 'defaulted') AS defaults,
            COUNT(*) FILTER (WHERE rs.status = 'paid') AS total_repayments
        FROM loans l
        JOIN repayment_schedules rs ON l.loan_id = rs.loan_id
        LEFT JOIN repayments r ON rs.schedule_id = r.schedule_id AND r.status = 'completed'
        WHERE l.user_id = p_user_id
    ),
    financial_data AS (
        SELECT COALESCE(monthly_family_income, 0) AS monthly_family_income,
               monthly_family_income IS NOT NULL AS has_income
        FROM user_profiles WHERE user_id = p_user_id
    ),
    obligation_data AS (
        SELECT
            COUNT(DISTINCT l.loan_id) AS active_loans,
            COALESCE(SUM(rs.expected_amount), 0) AS monthly_obligations
        FROM loans l
        JOIN repayment_schedules rs ON l.loan_id = rs.loan_id
        WHERE l.user_id = p_user_id
          AND l.status = 'active'
          AND rs.status IN ('pending', 'overdue')
          AND rs.due_date >= DATE_TRUNC('month', CURRENT_DATE)
          AND rs.due_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    ),
    user_data AS (
        SELECT email_verified, phone, created_at
        FROM users WHERE user_id = p_user_id
    ),
    verification_data AS (
        SELECT
            COALESCE(array_agg(verification_type), '{}') AS types,
            COUNT(*) AS count
        FROM verification_requests
        WHERE user_id = p_user_id AND status = 'approved'
    ),
    application_data AS (
        SELECT COUNT(*) AS recent_apps
        FROM loan_applications
        WHERE user_id = p_user_id AND created_at >= NOW() - INTERVAL '90 days'
    )
    SELECT json_build_object(
        'repayment', json_build_object(
            'totalDuePayments', COALESCE(rd.total_due, 0),
            'onTimePayments', COALESCE(rd.on_time, 0),
            'latePayments', COALESCE(rd.late, 0),
            'missedPayments', COALESCE(rd.missed, 0),
            'defaults', COALESCE(rd.defaults, 0)
        ),
        'financial', json_build_object(
            'monthlyIncome', CASE WHEN fd.has_income THEN fd.monthly_family_income ELSE NULL END,
            'monthlyDebtObligations', COALESCE(od.monthly_obligations, 0),
            'activeLoanCount', COALESCE(od.active_loans, 0)
        ),
        'behavior', json_build_object('hasTransactionData', false),
        'verification', json_build_object(
            'identityVerified', 'identity' = ANY(vd.types),
            'phoneVerified', ud.phone IS NOT NULL,
            'emailVerified', COALESCE(ud.email_verified, false),
            'addressVerified', 'address' = ANY(vd.types),
            'incomeVerified', 'income' = ANY(vd.types),
            'studentVerified', 'student' = ANY(vd.types)
        ),
        'credit', json_build_object(
            'activeLoanCount', COALESCE(od.active_loans, 0),
            'recentApplications', COALESCE(ad.recent_apps, 0)
        ),
        'tenure', json_build_object(
            'accountAgeDays', GREATEST(0, EXTRACT(DAY FROM NOW() - ud.created_at)::INT),
            'totalRepaymentCount', COALESCE(rd.total_repayments, 0),
            'verificationCount', COALESCE(vd.count, 0)
        )
    ) INTO v_result
    FROM repayment_data rd
    CROSS JOIN financial_data fd
    CROSS JOIN obligation_data od
    CROSS JOIN user_data ud
    CROSS JOIN verification_data vd
    CROSS JOIN application_data ad;

    RETURN v_result;
END;
$func$;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_funding_partners_updated_at BEFORE UPDATE ON funding_partners FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_loan_applications_updated_at BEFORE UPDATE ON loan_applications FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_audit_logs_append_only BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE PROCEDURE prevent_update_delete();
CREATE TRIGGER trg_trust_scores_append_only BEFORE DELETE ON trust_scores FOR EACH ROW EXECUTE PROCEDURE prevent_update_delete();
CREATE TRIGGER trg_trust_scores_restrict_update BEFORE UPDATE ON trust_scores FOR EACH ROW EXECUTE PROCEDURE restrict_trust_scores_update();
CREATE TRIGGER trg_repayments_append_only BEFORE UPDATE OR DELETE ON repayments FOR EACH ROW EXECUTE PROCEDURE prevent_update_delete();