ALTER TABLE trust_scores ALTER COLUMN trust_band TYPE VARCHAR(20);
ALTER TABLE trust_scores ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2);
ALTER TABLE trust_score_factors ADD COLUMN IF NOT EXISTS factor_weight DECIMAL(3,2);

CREATE INDEX IF NOT EXISTS idx_institutions_name ON institutions(name);
CREATE INDEX IF NOT EXISTS idx_institutions_type ON institutions(type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_trust_scores_user_current ON trust_scores(user_id) WHERE is_current = TRUE;
