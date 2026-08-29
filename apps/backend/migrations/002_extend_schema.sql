-- Migration 002: Extend schema for data integrity implementation
-- Adds investor_profiles, loan_products tables
-- Extends user_profiles, verification_requests, verification_documents
-- Updates role constraint to include 'lender'

-- ============================================================
-- 1. Extend users role constraint to include 'lender'
-- ============================================================
ALTER TABLE users DROP CONSTRAINT chk_users_role;
ALTER TABLE users ADD CONSTRAINT chk_users_role
  CHECK (role IN ('borrower', 'lender', 'admin', 'partner_agent'));

-- Add partner_id for partner_agent assignment
ALTER TABLE users ADD COLUMN partner_id UUID REFERENCES funding_partners (partner_id) ON DELETE SET NULL;

-- ============================================================
-- 2. Extend user_profiles with employment and completion fields
-- ============================================================
ALTER TABLE user_profiles ADD COLUMN profile_completion_status VARCHAR(30) NOT NULL DEFAULT 'incomplete';
ALTER TABLE user_profiles ADD COLUMN employment_type VARCHAR(50);
ALTER TABLE user_profiles ADD COLUMN employer_name VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN monthly_income DECIMAL(12,2);
ALTER TABLE user_profiles ADD COLUMN income_source VARCHAR(100);

ALTER TABLE user_profiles ADD CONSTRAINT chk_profile_completion_status
  CHECK (profile_completion_status IN (
    'incomplete', 'pending_verification', 'under_review',
    'verified', 'rejected', 'needs_update'
  ));

-- ============================================================
-- 3. Extend verification_requests
-- ============================================================
ALTER TABLE verification_requests ADD COLUMN verification_source VARCHAR(30) NOT NULL DEFAULT 'manual_review';

-- Update verification_type constraint to include income, address
ALTER TABLE verification_requests DROP CONSTRAINT IF EXISTS chk_verif_req_type;
-- Note: original schema has no named constraint on verification_type, add one
ALTER TABLE verification_requests ADD CONSTRAINT chk_verif_req_type
  CHECK (verification_type IN ('identity', 'student', 'document', 'guarantor', 'income', 'address'));

ALTER TABLE verification_requests ADD CONSTRAINT chk_verif_req_source
  CHECK (verification_source IN ('manual_review', 'external_provider', 'demo_verification'));

-- ============================================================
-- 4. Extend verification_documents
-- ============================================================
ALTER TABLE verification_documents ADD COLUMN document_status VARCHAR(30) NOT NULL DEFAULT 'uploaded';
ALTER TABLE verification_documents ADD COLUMN assessment_result JSONB;
ALTER TABLE verification_documents ADD COLUMN validity_expires_at TIMESTAMPTZ;

ALTER TABLE verification_documents ADD CONSTRAINT chk_verif_doc_status
  CHECK (document_status IN (
    'pending_upload', 'uploaded', 'under_review',
    'verified', 'rejected', 'needs_resubmission', 'demo_verified'
  ));

-- Update document_type constraint to add more types
ALTER TABLE verification_documents DROP CONSTRAINT chk_verif_doc_type;
ALTER TABLE verification_documents ADD CONSTRAINT chk_verif_doc_type
  CHECK (document_type IN (
    'nid_front', 'nid_back', 'student_id', 'tuition_receipt',
    'utility_bill', 'income_proof', 'address_proof',
    'nid', 'other'
  ));

-- ============================================================
-- 5. Create investor_profiles table
-- ============================================================
CREATE TABLE investor_profiles (
  investor_profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
  display_name VARCHAR(255),
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

ALTER TABLE investor_profiles ADD CONSTRAINT chk_investor_verification_status
  CHECK (verification_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE investor_profiles ADD CONSTRAINT chk_investor_account_status
  CHECK (account_status IN ('active', 'suspended', 'deactivated'));

ALTER TABLE investor_profiles ADD CONSTRAINT chk_investor_kyc_status
  CHECK (kyc_status IN (
    'incomplete', 'pending_verification', 'under_review',
    'verified', 'rejected', 'needs_update'
  ));

ALTER TABLE investor_profiles ADD CONSTRAINT chk_investor_risk_preference
  CHECK (risk_preference IS NULL OR risk_preference IN ('conservative', 'moderate', 'aggressive'));

CREATE TRIGGER trg_investor_profiles_updated_at
  BEFORE UPDATE ON investor_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- ============================================================
-- 6. Create loan_products table
-- ============================================================
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

ALTER TABLE loan_products ADD CONSTRAINT chk_loan_products_category
  CHECK (category IN ('education', 'emergency', 'business', 'personal', 'development'));

ALTER TABLE loan_products ADD CONSTRAINT chk_loan_products_amounts
  CHECK (min_amount > 0 AND max_amount >= min_amount);

ALTER TABLE loan_products ADD CONSTRAINT chk_loan_products_rate
  CHECK (interest_rate >= 0);

ALTER TABLE loan_products ADD CONSTRAINT chk_loan_products_tenure
  CHECK (duration_months > 0);

CREATE TRIGGER trg_loan_products_updated_at
  BEFORE UPDATE ON loan_products
  FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Add product_id FK to loan_applications for tracking which product was applied to
ALTER TABLE loan_applications ADD COLUMN product_id UUID REFERENCES loan_products (product_id) ON DELETE SET NULL;

-- ============================================================
-- 7. Indexes
-- ============================================================
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
