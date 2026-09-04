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
  profile_completion_status VARCHAR(30) NOT NULL DEFAULT 'incomplete',
  employment_type VARCHAR(50),
  employer_name VARCHAR(255),
  monthly_income DECIMAL(12,2),
  income_source VARCHAR(100),
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
  verification_source VARCHAR(30) NOT NULL DEFAULT 'manual_review',
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
  document_status VARCHAR(30) NOT NULL DEFAULT 'uploaded',
  assessment_result JSONB,
  validity_expires_at TIMESTAMPTZ,
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
  address TEXT,
  branch VARCHAR(255),
  goal VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
  ADD COLUMN partner_id UUID REFERENCES funding_partners (partner_id) ON DELETE SET NULL;

CREATE TABLE investor_profiles (
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

CREATE TABLE loan_products (
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
 
CREATE TABLE loan_applications (
  application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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