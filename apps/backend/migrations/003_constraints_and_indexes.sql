-- 1. Domain checks (Enums via CHECK constraints)
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

-- 2. Value Range Constraints
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
-- factor_weight is 0.00 to 1.00 or could be percentage
ALTER TABLE trust_score_factors ADD CONSTRAINT chk_trust_factors_weight CHECK (factor_weight IS NULL OR (factor_weight >= 0 AND factor_weight <= 1.00));

ALTER TABLE notifications ADD CONSTRAINT chk_notifications_retry CHECK (retry_count >= 0);

-- 3. Date and Timestamp Constraints
ALTER TABLE loans ADD CONSTRAINT chk_loans_dates CHECK (expected_end_date >= start_date);
ALTER TABLE partner_rules ADD CONSTRAINT chk_partner_rules_dates CHECK (effective_until IS NULL OR effective_until >= effective_from);
ALTER TABLE verification_requests ADD CONSTRAINT chk_verif_req_dates CHECK (reviewed_at IS NULL OR reviewed_at >= submitted_at);
ALTER TABLE fraud_flags ADD CONSTRAINT chk_fraud_flags_dates CHECK (resolved_at IS NULL OR resolved_at >= flagged_at);

-- 4. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_funding_partners_updated_at BEFORE UPDATE ON funding_partners FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_loan_applications_updated_at BEFORE UPDATE ON loan_applications FOR EACH ROW EXECUTE PROCEDURE update_timestamp();
CREATE TRIGGER trg_loans_updated_at BEFORE UPDATE ON loans FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- 5. Append-only protections
CREATE OR REPLACE FUNCTION prevent_update_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Updates and Deletes are not allowed on this table';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_logs_append_only BEFORE UPDATE OR DELETE ON audit_logs FOR EACH ROW EXECUTE PROCEDURE prevent_update_delete();
CREATE TRIGGER trg_trust_scores_append_only BEFORE DELETE ON trust_scores FOR EACH ROW EXECUTE PROCEDURE prevent_update_delete();
-- We allow UPDATE on trust_scores to set is_current = false. Let's create a specific trigger for that.
CREATE OR REPLACE FUNCTION restrict_trust_scores_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Only allow updating the is_current field to false
    IF NEW.score != OLD.score OR NEW.trust_band != OLD.trust_band OR NEW.user_id != OLD.user_id THEN
        RAISE EXCEPTION 'Only is_current can be updated on trust_scores';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_trust_scores_restrict_update BEFORE UPDATE ON trust_scores FOR EACH ROW EXECUTE PROCEDURE restrict_trust_scores_update();

CREATE TRIGGER trg_repayments_append_only BEFORE UPDATE OR DELETE ON repayments FOR EACH ROW EXECUTE PROCEDURE prevent_update_delete();

-- 6. Add provider reference to repayments
ALTER TABLE repayments ADD COLUMN provider_reference VARCHAR(100);
CREATE UNIQUE INDEX idx_repayments_provider_ref ON repayments(provider_reference) WHERE provider_reference IS NOT NULL;

-- Fix the old non-unique index if it exists
DROP INDEX IF EXISTS idx_trust_scores_user_current;
CREATE UNIQUE INDEX idx_trust_scores_user_current ON trust_scores(user_id) WHERE is_current = TRUE;

-- 7. Change foreign keys for history retention
ALTER TABLE repayments DROP CONSTRAINT repayments_schedule_id_fkey;
ALTER TABLE repayments ADD CONSTRAINT repayments_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES repayment_schedules (schedule_id) ON DELETE RESTRICT;

ALTER TABLE trust_scores DROP CONSTRAINT trust_scores_user_id_fkey;
ALTER TABLE trust_scores ADD CONSTRAINT trust_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE RESTRICT;

ALTER TABLE trust_score_factors DROP CONSTRAINT trust_score_factors_score_id_fkey;
ALTER TABLE trust_score_factors ADD CONSTRAINT trust_score_factors_score_id_fkey FOREIGN KEY (score_id) REFERENCES trust_scores (score_id) ON DELETE RESTRICT;

-- Note: audit_logs.user_id already uses ON DELETE SET NULL, which is correct for retention.

-- Note: Cross-row consistency (loan ↔ application ↔ offer ↔ partner agreement)
-- is enforced in application transactions, not triggers, per design decision.
