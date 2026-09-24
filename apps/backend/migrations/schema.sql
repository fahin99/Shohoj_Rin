CREATE EXTENSION IF NOT EXISTS pgcrypto;
 
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'borrower',
  account_status VARCHAR(20) NOT NULL DEFAULT 'active',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (LOWER(username)) WHERE username IS NOT NULL;
 
CREATE TABLE IF NOT EXISTS login_sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  refresh_token_hash VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS institutions (
  institution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  address TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS user_profiles (
  profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  full_name VARCHAR(255),
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
  profile_completion_status VARCHAR(30) NOT NULL DEFAULT 'incomplete',
  employment_type VARCHAR(50),
  employer_name VARCHAR(255),
  monthly_income DECIMAL(12,2),
  monthly_savings DECIMAL(12,2),
  income_source VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS verification_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reviewer_id UUID REFERENCES users (user_id) ON DELETE SET NULL,
  reviewer_notes TEXT,
  verification_source VARCHAR(30) NOT NULL DEFAULT 'manual_review',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);
 
CREATE TABLE IF NOT EXISTS verification_documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES verification_requests (request_id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  mime_type VARCHAR(100),
  document_status VARCHAR(30) NOT NULL DEFAULT 'uploaded',
  assessment_result JSONB,
  validity_expires_at TIMESTAMPTZ,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS guarantors (
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
 
CREATE TABLE IF NOT EXISTS trust_scores (
  score_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
  score DECIMAL(5,2) NOT NULL,
  trust_band VARCHAR(20) NOT NULL,
  confidence_score DECIMAL(5,2),
  trigger_event VARCHAR(100) NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS trust_score_factors (
  factor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_id UUID NOT NULL REFERENCES trust_scores (score_id) ON DELETE RESTRICT,
  factor_name VARCHAR(100) NOT NULL,
  factor_value DECIMAL(6,2) NOT NULL,
  factor_weight DECIMAL(3,2),
  description TEXT
);
 
CREATE TABLE IF NOT EXISTS funding_partners (
  partner_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  address TEXT,
  branch VARCHAR(255),
  goal VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
  ADD COLUMN partner_id UUID REFERENCES funding_partners (partner_id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS investor_profiles (
  investor_profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  company VARCHAR(255),
  address TEXT,
  verification_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  funding_capacity DECIMAL(14,2),
  preferred_categories TEXT[],
  risk_preference VARCHAR(30),
  max_exposure DECIMAL(14,2),
  account_status VARCHAR(20) NOT NULL DEFAULT 'active',
  kyc_status VARCHAR(30) NOT NULL DEFAULT 'incomplete',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS loan_products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES funding_partners (partner_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  min_amount DECIMAL(12,2) NOT NULL,
  max_amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  description TEXT,
  eligibility JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS loan_applications (
  application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code VARCHAR(20),
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  partner_id UUID REFERENCES funding_partners (partner_id) ON DELETE SET NULL,
  requested_amount DECIMAL(12,2) NOT NULL,
  purpose VARCHAR(100) NOT NULL,
  purpose_description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  trust_score_id UUID REFERENCES trust_scores (score_id) ON DELETE SET NULL,
  product_id UUID REFERENCES loan_products (product_id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_loan_applications_reference_code
  ON loan_applications (reference_code) WHERE reference_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS funding_commitments (
  commitment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications (application_id) ON DELETE RESTRICT,
  lender_user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE RESTRICT,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'committed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_id, lender_user_id)
);

CREATE TABLE IF NOT EXISTS lender_application_matches (
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
 
CREATE TABLE IF NOT EXISTS loan_offers (
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
 
CREATE TABLE IF NOT EXISTS loans (
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
 
CREATE TABLE IF NOT EXISTS loan_disbursements (
  disbursement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans (loan_id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  disbursement_method VARCHAR(50),
  reference_number VARCHAR(100),
  disbursed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS repayment_schedules (
  schedule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans (loan_id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  expected_amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (loan_id, installment_number)
);

CREATE TABLE IF NOT EXISTS repayments (
  repayment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES repayment_schedules (schedule_id) ON DELETE RESTRICT,
  amount_paid DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_reference VARCHAR(100),
  provider_reference VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS partner_rules (
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
 
CREATE TABLE IF NOT EXISTS partner_decisions (
  decision_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES loan_applications (application_id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES funding_partners (partner_id) ON DELETE RESTRICT,
  decision VARCHAR(20) NOT NULL,
  reason TEXT,
  decided_by UUID REFERENCES users (user_id) ON DELETE SET NULL,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
 
CREATE TABLE IF NOT EXISTS fraud_flags (
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
 
CREATE TABLE IF NOT EXISTS audit_logs (
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
 
CREATE TABLE IF NOT EXISTS notifications (
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
CREATE UNIQUE INDEX idx_funding_partners_name_normalized ON funding_partners (lower(regexp_replace(btrim(name), '\s+', ' ', 'g')));

CREATE INDEX idx_institutions_name ON institutions(name);
CREATE INDEX idx_institutions_type ON institutions(type);
CREATE UNIQUE INDEX idx_trust_scores_user_current ON trust_scores(user_id) WHERE is_current = TRUE;
CREATE UNIQUE INDEX idx_repayments_provider_ref ON repayments(provider_reference) WHERE provider_reference IS NOT NULL;
CREATE INDEX idx_user_profiles_completion ON user_profiles(profile_completion_status);
CREATE INDEX idx_verification_requests_user ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_documents_request ON verification_documents(request_id);
CREATE INDEX idx_loan_products_category ON loan_products(category);
CREATE INDEX idx_loan_products_active ON loan_products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_investor_profiles_user ON investor_profiles(user_id);
CREATE INDEX idx_loan_applications_user ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_partner ON loans(partner_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_funding_commitments_lender ON funding_commitments(lender_user_id, status, created_at DESC);
CREATE INDEX idx_funding_commitments_application ON funding_commitments(application_id, status);
CREATE INDEX idx_lender_matches_lender ON lender_application_matches(lender_user_id, status, matched_at DESC);
CREATE INDEX idx_lender_matches_application ON lender_application_matches(application_id, priority ASC);
ALTER TABLE users ADD CONSTRAINT chk_users_role CHECK (role IN ('borrower', 'lender', 'admin', 'partner_agent'));
ALTER TABLE users ADD CONSTRAINT chk_users_account_status CHECK (account_status IN ('active', 'suspended', 'deactivated'));
ALTER TABLE user_profiles ADD CONSTRAINT chk_profile_completion_status CHECK (profile_completion_status IN ('incomplete', 'pending_verification', 'under_review', 'verified', 'rejected', 'needs_update'));
 
ALTER TABLE verification_requests ADD CONSTRAINT chk_verif_req_status CHECK (status IN ('pending', 'approved', 'rejected', 'needs_review'));
ALTER TABLE verification_requests ADD CONSTRAINT chk_verif_req_type CHECK (verification_type IN ('identity', 'student', 'document', 'guarantor', 'income', 'address'));
ALTER TABLE verification_requests ADD CONSTRAINT chk_verif_req_source CHECK (verification_source IN ('manual_review', 'external_provider', 'demo_verification'));
ALTER TABLE verification_documents ADD CONSTRAINT chk_verif_doc_type CHECK (document_type IN (
  'nid_front', 'nid_back', 'student_id', 'tuition_receipt', 'utility_bill', 'income_proof', 'address_proof', 'nid', 
  'tin_certificate','trade_license','incorporation_certificate','regulatory_license','other'));
ALTER TABLE verification_documents ADD CONSTRAINT chk_verif_doc_status CHECK (document_status IN ('pending_upload', 'uploaded', 'under_review', 'verified', 'rejected', 'needs_resubmission', 'demo_verified'));

ALTER TABLE investor_profiles ADD CONSTRAINT chk_investor_verification_status CHECK (verification_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE investor_profiles ADD CONSTRAINT chk_investor_account_status CHECK (account_status IN ('active', 'suspended', 'deactivated'));
ALTER TABLE investor_profiles ADD CONSTRAINT chk_investor_kyc_status CHECK (kyc_status IN ('incomplete', 'pending_verification', 'under_review', 'verified', 'rejected', 'needs_update'));
ALTER TABLE investor_profiles ADD CONSTRAINT chk_investor_risk_preference CHECK (risk_preference IS NULL OR risk_preference IN ('conservative', 'moderate', 'aggressive'));

ALTER TABLE loan_products ADD CONSTRAINT chk_loan_products_category CHECK (category IN ('education', 'emergency', 'business', 'personal', 'development'));
ALTER TABLE loan_products ADD CONSTRAINT chk_loan_products_amounts CHECK (min_amount > 0 AND max_amount >= min_amount);
ALTER TABLE loan_products ADD CONSTRAINT chk_loan_products_rate CHECK (interest_rate >= 0);
ALTER TABLE loan_products ADD CONSTRAINT chk_loan_products_tenure CHECK (duration_months > 0);
 
ALTER TABLE trust_scores ADD CONSTRAINT chk_trust_scores_band CHECK (trust_band IN ('very_low_risk', 'low_risk', 'moderate_risk', 'high_risk', 'very_high_risk'));
 
ALTER TABLE loan_applications ADD CONSTRAINT chk_loan_app_status CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'disbursed', 'active', 'completed', 'overdue', 'defaulted'));
ALTER TABLE funding_commitments ADD CONSTRAINT chk_funding_commitments_status CHECK (status IN ('committed', 'cancelled'));
ALTER TABLE lender_application_matches ADD CONSTRAINT chk_lender_match_status CHECK (status IN ('pending', 'viewed', 'accepted', 'rejected', 'expired'));
ALTER TABLE loan_offers ADD CONSTRAINT chk_loan_offer_status CHECK (status IN ('pending', 'accepted', 'declined', 'expired'));
ALTER TABLE loans ADD CONSTRAINT chk_loans_status CHECK (status IN ('pending_disbursement', 'active', 'completed', 'overdue', 'delinquent', 'defaulted'));
 
ALTER TABLE repayment_schedules ADD CONSTRAINT chk_repayment_schedule_status CHECK (status IN ('pending', 'paid', 'partially_paid', 'overdue', 'defaulted'));
ALTER TABLE repayments ADD CONSTRAINT chk_repayments_status CHECK (status IN ('completed', 'failed', 'reversed'));
 
ALTER TABLE partner_decisions ADD CONSTRAINT chk_partner_decisions_decision CHECK (decision IN ('approved', 'rejected', 'manual_review'));
 
ALTER TABLE fraud_flags ADD CONSTRAINT chk_fraud_flags_status CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed'));
ALTER TABLE fraud_flags ADD CONSTRAINT chk_fraud_flags_severity CHECK (severity IN ('low', 'medium', 'high', 'critical'));
 
ALTER TABLE notifications ADD CONSTRAINT chk_notifications_delivery_status CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed'));
ALTER TABLE loan_applications ADD CONSTRAINT chk_loan_app_amount CHECK (requested_amount > 0);
ALTER TABLE funding_commitments ADD CONSTRAINT chk_funding_commitments_amount CHECK (amount > 0);
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
    INOUT out_is_duplicate BOOLEAN DEFAULT FALSE
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
        schedule_id, amount_paid, payment_method, transaction_reference, provider_reference, status
    ) VALUES (
        p_schedule_id, ROUND(p_amount_paid, 2), p_payment_method, p_txn_reference, p_provider_ref, p_status
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

CREATE OR REPLACE PROCEDURE generate_repayment_schedule(
    p_loan_id UUID,
    p_principal DECIMAL(12,2),
    p_annual_rate DECIMAL(5,2),
    p_tenure_months INTEGER,
    p_start_date DATE DEFAULT CURRENT_DATE
)
LANGUAGE plpgsql
AS $proc$
DECLARE
    v_monthly_rate DECIMAL(18,12);
    v_installment DECIMAL(12,2);
    i INTEGER;
BEGIN
    IF p_principal <= 0 OR p_annual_rate < 0 OR p_tenure_months <= 0 THEN
        RAISE EXCEPTION 'Invalid repayment-schedule inputs' USING ERRCODE = 'P0001';
    END IF;

    v_monthly_rate := p_annual_rate / 1200.0;
    v_installment := CASE
        WHEN v_monthly_rate = 0 THEN ROUND(p_principal / p_tenure_months, 2)
        ELSE ROUND(
            p_principal * v_monthly_rate * POWER(1 + v_monthly_rate, p_tenure_months)
            / (POWER(1 + v_monthly_rate, p_tenure_months) - 1),
            2
        )
    END;

    FOR i IN 1..p_tenure_months LOOP
        INSERT INTO repayment_schedules (loan_id, installment_number, due_date, expected_amount, status)
        VALUES (p_loan_id, i, (p_start_date + (i || ' months')::INTERVAL)::DATE, v_installment, 'pending')
        ON CONFLICT (loan_id, installment_number) DO NOTHING;
    END LOOP;
END;
$proc$;

CREATE OR REPLACE PROCEDURE mark_overdue_schedules()
LANGUAGE plpgsql
AS $proc$
DECLARE
    v_loan_id UUID;
BEGIN
    FOR v_loan_id IN
        WITH changed AS (
            UPDATE repayment_schedules
            SET status = 'overdue'
            WHERE status IN ('pending', 'partially_paid') AND due_date < CURRENT_DATE
            RETURNING loan_id
        )
        SELECT DISTINCT loan_id FROM changed
    LOOP
        UPDATE loans SET status = 'overdue', updated_at = NOW()
        WHERE loan_id = v_loan_id AND status = 'active';
        INSERT INTO audit_logs (action, entity_type, entity_id, after_state)
        VALUES ('loan_overdue_auto', 'loan', v_loan_id,
                jsonb_build_object('status', 'overdue', 'marked_at', NOW()));
    END LOOP;
END;
$proc$;

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

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_funding_partners_updated_at BEFORE UPDATE ON funding_partners FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_investor_profiles_updated_at BEFORE UPDATE ON investor_profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_loan_products_updated_at BEFORE UPDATE ON loan_products FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_loan_applications_updated_at BEFORE UPDATE ON loan_applications FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_funding_commitments_updated_at BEFORE UPDATE ON funding_commitments FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_audit_logs_append_only BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE PROCEDURE prevent_update_delete();
CREATE TRIGGER trg_trust_scores_append_only BEFORE DELETE ON trust_scores FOR EACH ROW EXECUTE PROCEDURE prevent_update_delete();
CREATE TRIGGER trg_trust_scores_restrict_update BEFORE UPDATE ON trust_scores FOR EACH ROW EXECUTE PROCEDURE restrict_trust_scores_update();
CREATE TRIGGER trg_repayments_append_only BEFORE UPDATE OR DELETE ON repayments FOR EACH ROW EXECUTE PROCEDURE prevent_update_delete();
CREATE TRIGGER trg_users_ensure_lender_investor_profile AFTER INSERT OR UPDATE OF role ON users FOR EACH ROW EXECUTE PROCEDURE ensure_lender_investor_profile();
