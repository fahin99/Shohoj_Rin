CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS fraud_flags;
DROP TABLE IF EXISTS partner_decisions;
DROP TABLE IF EXISTS partner_rules;
DROP TABLE IF EXISTS repayments;
DROP TABLE IF EXISTS repayment_schedules;
DROP TABLE IF EXISTS loan_disbursements;
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS loan_offers;
DROP TABLE IF EXISTS loan_applications;
DROP TABLE IF EXISTS trust_score_factors;
DROP TABLE IF EXISTS trust_scores;
DROP TABLE IF EXISTS guarantors;
DROP TABLE IF EXISTS verification_documents;
DROP TABLE IF EXISTS verification_requests;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS login_sessions;
DROP TABLE IF EXISTS institutions;
DROP TABLE IF EXISTS funding_partners;
DROP TABLE IF EXISTS users;

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
  user_id UUID NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  score DECIMAL(5,2) NOT NULL,
  trust_band VARCHAR(10) NOT NULL,
  trigger_event VARCHAR(100) NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trust_score_factors (
  factor_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_id UUID NOT NULL REFERENCES trust_scores (score_id) ON DELETE CASCADE,
  factor_name VARCHAR(100) NOT NULL,
  factor_value DECIMAL(6,2) NOT NULL,
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
  schedule_id UUID NOT NULL REFERENCES repayment_schedules (schedule_id) ON DELETE CASCADE,
  amount_paid DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_reference VARCHAR(100),
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
