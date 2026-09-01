import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";

const router = Router();

const investorProfileSchema = z.object({
  displayName: z.string().trim().min(2).optional(),
  fundingCapacity: z.number().positive().optional(),
  preferredCategories: z.array(z.string()).optional(),
  riskPreference: z.enum(["conservative", "moderate", "aggressive"]).optional(),
  maxExposure: z.number().positive().optional(),
});

function requireLender(req: RequestWithAuth, res: any, next: any) {
  if (!req.auth || req.auth.role !== "lender") {
    return res.status(403).json({
      success: false,
      error: { message: "Investor/lender access required" },
    });
  }
  return next();
}

router.get("/profile", requireAuth, requireLender, async (req, res) => {
  const userId = (req as RequestWithAuth).auth!.userId;

  try {
    const result = await pool.query(
      `SELECT
         investor_profile_id AS "investorProfileId",
         user_id AS "userId",
         display_name AS "displayName",
         verification_status AS "verificationStatus",
         funding_capacity AS "fundingCapacity",
         preferred_categories AS "preferredCategories",
         risk_preference AS "riskPreference",
         max_exposure AS "maxExposure",
         account_status AS "accountStatus",
         kyc_status AS "kycStatus",
         created_at AS "createdAt",
         updated_at AS "updatedAt"
       FROM investor_profiles
       WHERE user_id = $1`,
      [userId],
    );

    if (result.rowCount === 0) {
      const insert = await pool.query(
        `INSERT INTO investor_profiles (user_id, verification_status, kyc_status, account_status)
         VALUES ($1, 'pending', 'incomplete', 'active')
         RETURNING
           investor_profile_id AS "investorProfileId",
           user_id AS "userId",
           display_name AS "displayName",
           verification_status AS "verificationStatus",
           funding_capacity AS "fundingCapacity",
           preferred_categories AS "preferredCategories",
           risk_preference AS "riskPreference",
           max_exposure AS "maxExposure",
           account_status AS "accountStatus",
           kyc_status AS "kycStatus",
           created_at AS "createdAt",
           updated_at AS "updatedAt"`,
        [userId],
      );
      return res.status(200).json({ success: true, data: insert.rows[0] });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Failed to fetch investor profile:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to fetch investor profile" } });
  }
});

router.put("/profile", requireAuth, requireLender, async (req, res) => {
  const userId = (req as RequestWithAuth).auth!.userId;
  const parsed = investorProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid investor profile data", details: parsed.error.flatten() },
    });
  }

  const data = parsed.data;
  const allowedCategories = ["education", "emergency", "business", "personal", "development"];
  if (data.preferredCategories) {
    const invalid = data.preferredCategories.filter((category) => !allowedCategories.includes(category));
    if (invalid.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: `Unsupported category values: ${invalid.join(", ")}` },
      });
    }
  }

  try {
    const result = await pool.query(
      `INSERT INTO investor_profiles (
         user_id, display_name, funding_capacity, preferred_categories,
         risk_preference, max_exposure, verification_status, kyc_status, account_status
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 'incomplete', 'active')
       ON CONFLICT (user_id) DO UPDATE SET
         display_name = COALESCE(EXCLUDED.display_name, investor_profiles.display_name),
         funding_capacity = COALESCE(EXCLUDED.funding_capacity, investor_profiles.funding_capacity),
         preferred_categories = COALESCE(EXCLUDED.preferred_categories, investor_profiles.preferred_categories),
         risk_preference = COALESCE(EXCLUDED.risk_preference, investor_profiles.risk_preference),
         max_exposure = COALESCE(EXCLUDED.max_exposure, investor_profiles.max_exposure),
         updated_at = NOW()
       RETURNING
         investor_profile_id AS "investorProfileId",
         user_id AS "userId",
         display_name AS "displayName",
         verification_status AS "verificationStatus",
         funding_capacity AS "fundingCapacity",
         preferred_categories AS "preferredCategories",
         risk_preference AS "riskPreference",
         max_exposure AS "maxExposure",
         account_status AS "accountStatus",
         kyc_status AS "kycStatus",
         created_at AS "createdAt",
         updated_at AS "updatedAt"`,
      [
        userId,
        data.displayName ?? null,
        data.fundingCapacity ?? null,
        data.preferredCategories ?? null,
        data.riskPreference ?? null,
        data.maxExposure ?? null,
      ],
    );

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Failed to update investor profile:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to update investor profile" } });
  }
});

// GET /api/v1/investor/opportunities — lender-only application queue.
router.get("/opportunities", requireAuth, requireLender, async (req, res) => {
  const userId = (req as RequestWithAuth).auth!.userId;

  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `WITH lender_preferences AS (
         SELECT pref.category, pref.priority
         FROM investor_profiles ip
         CROSS JOIN LATERAL UNNEST(
           COALESCE(ip.preferred_categories, ARRAY[]::text[])
         ) WITH ORDINALITY AS pref(category, priority)
         WHERE ip.user_id = $1
           AND cardinality(COALESCE(ip.preferred_categories, ARRAY[]::text[])) > 0
       ),
       eligible_apps AS (
         SELECT
           la.application_id AS "applicationId",
           la.user_id AS "borrowerId",
           up.full_name AS "borrowerName",
           up.profile_completion_status AS "borrowerProfileStatus",
           la.purpose,
           la.purpose_description AS "purposeDescription",
           la.requested_amount AS "requestedAmount",
           la.status,
           la.submitted_at AS "submittedAt",
           la.product_id AS "productId",
           lp.name AS "productName",
           lp.category,
           lp.min_amount AS "minAmount",
           lp.max_amount AS "maxAmount",
           lp.interest_rate AS "interestRate",
           lp.duration_months AS "durationMonths",
           fp.name AS "partnerName",
           ts.score_id AS "trustScoreId",
           ts.trust_band AS "trustBand",
           ts.score AS "trustScore",
           (up.nid_number IS NOT NULL) AS "nidOnFile",
           EXISTS (
             SELECT 1 FROM verification_requests vr
             WHERE vr.user_id = la.user_id
               AND vr.verification_type = 'income'
               AND vr.status = 'approved'
           ) AS "incomeVerified",
           EXISTS (
             SELECT 1 FROM verification_requests vr
             WHERE vr.user_id = la.user_id
               AND vr.verification_type = 'address'
               AND vr.status = 'approved'
           ) AS "addressVerified",
           EXISTS (
             SELECT 1 FROM verification_requests vr
             WHERE vr.user_id = la.user_id
               AND vr.verification_type = 'identity'
               AND vr.status = 'approved'
           ) AS "identityVerified",
           COALESCE((
             SELECT SUM(fc.amount)
             FROM funding_commitments fc
             WHERE fc.application_id = la.application_id
               AND fc.status = 'committed'
           ), 0) AS "committedAmount",
           COALESCE((
             SELECT json_agg(json_build_object(
               'name', tsf.factor_name,
               'score', tsf.factor_value,
               'weight', tsf.factor_weight,
               'description', tsf.description
             ) ORDER BY tsf.factor_name)
             FROM trust_score_factors tsf
             WHERE tsf.score_id = ts.score_id
           ), '[]'::json) AS "trustFactors"
         FROM loan_applications la
         LEFT JOIN loan_products lp ON lp.product_id = la.product_id
         LEFT JOIN funding_partners fp ON fp.partner_id = la.partner_id
         LEFT JOIN trust_scores ts ON ts.score_id = la.trust_score_id
         LEFT JOIN user_profiles up ON up.user_id = la.user_id
         WHERE la.status IN ('submitted', 'under_review', 'approved')
           AND la.requested_amount > COALESCE((
             SELECT SUM(fc.amount)
             FROM funding_commitments fc
             WHERE fc.application_id = la.application_id
               AND fc.status = 'committed'
           ), 0)
       )
       SELECT
         ea."applicationId",
         ea."borrowerId",
         ea."borrowerName",
         ea."borrowerProfileStatus",
         ea.purpose,
         ea."purposeDescription",
         ea."requestedAmount",
         ea.status,
         ea."submittedAt",
         ea."productId",
         ea."productName",
         ea.category,
         ea."minAmount",
         ea."maxAmount",
         ea."interestRate",
         ea."durationMonths",
         ea."partnerName",
         ea."trustScoreId",
         ea."trustBand",
         ea."trustScore",
         ea."nidOnFile",
         ea."incomeVerified",
         ea."addressVerified",
         ea."identityVerified",
         ea."committedAmount",
         ea."trustFactors"
       FROM eligible_apps ea
       LEFT JOIN lender_preferences lpref ON lpref.category = ea.category
       WHERE NOT EXISTS (SELECT 1 FROM lender_preferences)
          OR lpref.category IS NOT NULL
       ORDER BY
         CASE WHEN EXISTS (SELECT 1 FROM lender_preferences) THEN lpref.priority ELSE 999999 END,
         ea."submittedAt" DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    const opportunities = result.rows.map((row: any) => ({
      ...row,
      requestedAmount: Number(row.requestedAmount),
      minAmount: row.minAmount == null ? null : Number(row.minAmount),
      maxAmount: row.maxAmount == null ? null : Number(row.maxAmount),
      interestRate: row.interestRate == null ? null : Number(row.interestRate),
      trustScore: row.trustScore == null ? null : Number(row.trustScore),
      committedAmount: Number(row.committedAmount || 0),
      trustFactors: Array.isArray(row.trustFactors) ? row.trustFactors : [],
    }));

    return res.status(200).json({ success: true, data: opportunities });
  } catch (error) {
    console.error("Failed to fetch opportunities:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to fetch opportunities" } });
  }
});

router.post("/fund/:applicationId", requireAuth, requireLender, async (req, res) => {
  const userId = (req as RequestWithAuth).auth!.userId;
  const applicationId = req.params.applicationId;
  const parsed = z.object({ amount: z.number().finite().positive() }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { message: "Invalid funding amount" } });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const appResult = await client.query(
      `SELECT application_id, status, partner_id, requested_amount
       FROM loan_applications
       WHERE application_id = $1
       FOR UPDATE`,
      [applicationId],
    );

    if (appResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: { message: "Application not found" } });
    }

    const app = appResult.rows[0] as any;
    if (!["submitted", "under_review", "approved"].includes(app.status)) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, error: { message: "Application is not eligible for funding" } });
    }

    const existingCommitment = await client.query(
      `SELECT commitment_id
       FROM funding_commitments
       WHERE application_id = $1 AND lender_user_id = $2
       FOR UPDATE`,
      [applicationId, userId],
    );
    if (existingCommitment.rowCount) {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, error: { message: "You have already funded this application" } });
    }

    const committedResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS committed_amount
       FROM funding_commitments
       WHERE application_id = $1 AND status = 'committed'`,
      [applicationId],
    );
    const remainingAmount = Math.round((Number(app.requested_amount) - Number(committedResult.rows[0].committed_amount)) * 100) / 100;
    const fundingAmount = Math.round(parsed.data.amount * 100) / 100;

    if (fundingAmount <= 0 || fundingAmount > remainingAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({ success: false, error: { message: "Funding amount must not exceed the remaining requested amount" } });
    }

    const commitmentResult = await client.query(
      `INSERT INTO funding_commitments (application_id, lender_user_id, amount, status)
       VALUES ($1, $2, $3, 'committed')
       RETURNING commitment_id, application_id, lender_user_id, amount, status, created_at`,
      [applicationId, userId, fundingAmount],
    );
    const commitment = commitmentResult.rows[0] as any;

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, after_state)
       VALUES ($1, 'funding_commitment_created', 'funding_commitment', $2,
               jsonb_build_object('applicationId', $3::uuid, 'amount', $4::numeric, 'status', 'committed'))`,
      [userId, commitment.commitment_id, applicationId, fundingAmount],
    );

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      data: {
        applicationId,
        commitmentId: commitment.commitment_id,
        fundedAmount: Number(commitment.amount),
        status: commitment.status,
        fundedAt: commitment.created_at,
        message: "Funding commitment recorded",
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (typeof error === "object" && error && "code" in error && (error as { code?: string }).code === "23505") {
      return res.status(409).json({ success: false, error: { message: "You have already funded this application" } });
    }
    console.error("Failed to fund opportunity:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to record funding commitment" } });
  } finally {
    client.release();
  }
});

router.get("/portfolio", requireAuth, requireLender, async (req, res) => {
  const userId = (req as RequestWithAuth).auth!.userId;

  try {
    const fundedResult = await pool.query(
      `SELECT
        fc.commitment_id AS "commitmentId",
        fc.application_id AS "applicationId",
        fc.amount AS "fundedAmount",
        fc.status AS "fundingStatus",
        fc.created_at AS "fundedAt",
        la.purpose,
        la.requested_amount AS "requestedAmount",
        la.status AS "applicationStatus",
        lp.name AS "productName",
        lp.category,
        lp.interest_rate AS "interestRate",
        fp.name AS "partnerName",
        ts.trust_band AS "trustBand",
        l.loan_id AS "loanId",
        l.status AS "loanStatus",
        l.principal_amount AS "principalAmount"
       FROM funding_commitments fc
       JOIN loan_applications la ON la.application_id = fc.application_id
       LEFT JOIN loan_products lp ON lp.product_id = la.product_id
       LEFT JOIN funding_partners fp ON fp.partner_id = la.partner_id
       LEFT JOIN trust_scores ts ON ts.score_id = la.trust_score_id
       LEFT JOIN loans l ON l.application_id = la.application_id
       WHERE fc.lender_user_id = $1
         AND fc.status = 'committed'
       ORDER BY fc.created_at DESC`,
      [userId],
    );

    const fundedLoans = fundedResult.rows.map((row: any) => ({
      ...row,
      fundedAmount: Number(row.fundedAmount || 0),
      requestedAmount: Number(row.requestedAmount || 0),
      interestRate: row.interestRate == null ? null : Number(row.interestRate),
      principalAmount: row.principalAmount == null ? null : Number(row.principalAmount),
    }));

    const totalDeployed = fundedLoans.reduce((sum: number, loan: any) => sum + loan.fundedAmount, 0);
    const activeLoans = fundedLoans.filter((loan: any) => loan.loanStatus === "active").length;

    return res.status(200).json({
      success: true,
      data: { totalDeployed, activeLoans, fundedLoans, totalFunded: fundedLoans.length },
    });
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to fetch portfolio" } });
  }
});

export default router;
