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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_funding_commitments_status'
  ) THEN
    ALTER TABLE funding_commitments
      ADD CONSTRAINT chk_funding_commitments_status CHECK (status IN ('committed', 'cancelled'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_funding_commitments_amount'
  ) THEN
    ALTER TABLE funding_commitments
      ADD CONSTRAINT chk_funding_commitments_amount CHECK (amount > 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_funding_commitments_lender
  ON funding_commitments(lender_user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_funding_commitments_application
  ON funding_commitments(application_id, status);
