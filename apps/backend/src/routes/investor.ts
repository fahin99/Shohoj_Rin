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

// GET /api/v1/investor/profile
router.get("/profile", requireAuth, requireLender, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;

  try {
    const result = await pool.query(
      `SELECT
        ip.investor_profile_id AS "investorProfileId",
        ip.user_id AS "userId",
        ip.display_name AS "displayName",
        ip.verification_status AS "verificationStatus",
        ip.funding_capacity AS "fundingCapacity",
        ip.preferred_categories AS "preferredCategories",
        ip.risk_preference AS "riskPreference",
        ip.max_exposure AS "maxExposure",
        ip.account_status AS "accountStatus",
        ip.kyc_status AS "kycStatus",
        ip.created_at AS "createdAt",
        ip.updated_at AS "updatedAt"
       FROM investor_profiles ip
       WHERE ip.user_id = $1`,
      [userId],
    );

    if (result.rowCount === 0) {
      // Auto-create profile for new investors
      const createResult = await pool.query(
        `INSERT INTO investor_profiles (user_id)
         VALUES ($1)
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
      return res.status(200).json({
        success: true,
        data: createResult.rows[0],
      });
    }

    const profile = result.rows[0] as any;
    return res.status(200).json({
      success: true,
      data: {
        ...profile,
        fundingCapacity: profile.fundingCapacity ? parseFloat(profile.fundingCapacity) : null,
        maxExposure: profile.maxExposure ? parseFloat(profile.maxExposure) : null,
        preferredCategories: profile.preferredCategories ?? [],
      },
    });
  } catch (error) {
    console.error("Failed to fetch investor profile:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch investor profile" },
    });
  }
});

// PUT /api/v1/investor/profile
router.put("/profile", requireAuth, requireLender, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;

  const parsed = investorProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid investor profile data", details: parsed.error.flatten() },
    });
  }

  const data = parsed.data;

  try {
    const setClauses: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (data.displayName !== undefined) {
      setClauses.push(`display_name = $${paramIdx++}`);
      params.push(data.displayName);
    }
    if (data.fundingCapacity !== undefined) {
      setClauses.push(`funding_capacity = $${paramIdx++}`);
      params.push(data.fundingCapacity);
    }
    if (data.preferredCategories !== undefined) {
      setClauses.push(`preferred_categories = $${paramIdx++}`);
      params.push(data.preferredCategories);
    }
    if (data.riskPreference !== undefined) {
      setClauses.push(`risk_preference = $${paramIdx++}`);
      params.push(data.riskPreference);
    }
    if (data.maxExposure !== undefined) {
      setClauses.push(`max_exposure = $${paramIdx++}`);
      params.push(data.maxExposure);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: "No fields to update" },
      });
    }

    params.push(userId);
    const result = await pool.query(
      `UPDATE investor_profiles
       SET ${setClauses.join(", ")}
       WHERE user_id = $${paramIdx}
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
      params,
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Investor profile not found" },
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Failed to update investor profile:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to update investor profile" },
    });
  }
});

// GET /api/v1/investor/opportunities — eligible funding opportunities
router.get("/opportunities", requireAuth, requireLender, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const offset = (page - 1) * limit;

    // Show submitted/approved applications as opportunities
    // Privacy: expose only decision-relevant data, NO raw NID/documents
    const result = await pool.query(
      `SELECT
        la.application_id AS "applicationId",
        la.purpose,
        la.requested_amount AS "requestedAmount",
        la.status,
        la.submitted_at AS "submittedAt",
        lp.name AS "productName",
        lp.category,
        lp.interest_rate AS "interestRate",
        lp.duration_months AS "durationMonths",
        fp.name AS "partnerName",
        ts.trust_band AS "trustBand",
        ts.score AS "trustScore",
        up.profile_completion_status AS "verificationStatus",
        CASE WHEN EXISTS (
          SELECT 1 FROM verification_requests vr
          WHERE vr.user_id = la.user_id AND vr.verification_type = 'income' AND vr.status = 'approved'
        ) THEN TRUE ELSE FALSE END AS "incomeVerified"
       FROM loan_applications la
       LEFT JOIN loan_products lp ON lp.product_id = la.product_id
       LEFT JOIN funding_partners fp ON fp.partner_id = la.partner_id
       LEFT JOIN trust_scores ts ON ts.score_id = la.trust_score_id
       LEFT JOIN user_profiles up ON up.user_id = la.user_id
        WHERE la.status IN ('submitted', 'under_review', 'approved')
          AND la.requested_amount > COALESCE(
            (SELECT SUM(fc.amount)
             FROM funding_commitments fc
             WHERE fc.application_id = la.application_id
               AND fc.status = 'committed'),
            0
          )
       ORDER BY la.submitted_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const opportunities = result.rows.map((row: any) => ({
      ...row,
      requestedAmount: parseFloat(row.requestedAmount),
      interestRate: row.interestRate ? parseFloat(row.interestRate) : null,
      trustScore: row.trustScore ? parseFloat(row.trustScore) : null,
    }));

    return res.status(200).json({
      success: true,
      data: opportunities,
    });
  } catch (error) {
    console.error("Failed to fetch opportunities:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch opportunities" },
    });
  }
});

// POST /api/v1/investor/fund/:applicationId — fund an opportunity
router.post("/fund/:applicationId", requireAuth, requireLender, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;
  const applicationId = req.params.applicationId;

  const amountSchema = z.object({ amount: z.number().finite().positive() });
  const parsed = amountSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid funding amount" },
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Locking the application serializes commitments so the requested amount cannot be over-funded.
    const appResult = await client.query(
      `SELECT application_id, status, partner_id, requested_amount
       FROM loan_applications
       WHERE application_id = $1
       FOR UPDATE`,
      [applicationId],
    );

    if (appResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        success: false,
        error: { message: "Application not found" },
      });
    }

    const app = appResult.rows[0] as any;
    if (!["submitted", "under_review", "approved"].includes(app.status)) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error: { message: "Application is not eligible for funding" },
      });
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
      return res.status(409).json({
        success: false,
        error: { message: "You have already funded this application" },
      });
    }

    const committedResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS committed_amount
       FROM funding_commitments
       WHERE application_id = $1 AND status = 'committed'`,
      [applicationId],
    );
    const requestedAmount = Number(app.requested_amount);
    const committedAmount = Number(committedResult.rows[0].committed_amount);
    const remainingAmount = Math.round((requestedAmount - committedAmount) * 100) / 100;
    const fundingAmount = Math.round(parsed.data.amount * 100) / 100;
    if (fundingAmount <= 0 || fundingAmount > remainingAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error: { message: "Funding amount must not exceed the remaining requested amount" },
      });
    }

    const commitmentResult = await client.query(
      `INSERT INTO funding_commitments (application_id, lender_user_id, amount, status)
       VALUES ($1, $2, $3, 'committed')
       RETURNING commitment_id, application_id, lender_user_id, amount, status, created_at`,
      [applicationId, userId, fundingAmount],
    );
    const commitment = commitmentResult.rows[0] as any;

    // Keep an immutable audit event, but never use it as the financial record.
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
      return res.status(409).json({
        success: false,
        error: { message: "You have already funded this application" },
      });
    }
    console.error("Failed to fund opportunity:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to record funding commitment" },
    });
  } finally {
    client.release();
  }
});

// GET /api/v1/investor/portfolio — portfolio summary
router.get("/portfolio", requireAuth, requireLender, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;

  try {
    // Funding commitments are the financial source of truth; audit logs are history only.
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
      fundedAmount: parseFloat(row.fundedAmount || "0"),
      requestedAmount: parseFloat(row.requestedAmount),
      interestRate: row.interestRate ? parseFloat(row.interestRate) : null,
      principalAmount: row.principalAmount ? parseFloat(row.principalAmount) : null,
    }));

    // Calculate portfolio metrics
    const totalDeployed = fundedLoans.reduce((sum: number, l: any) => sum + l.fundedAmount, 0);
    const activeLoans = fundedLoans.filter((l: any) => l.loanStatus === "active").length;

    return res.status(200).json({
      success: true,
      data: {
        totalDeployed,
        activeLoans,
        fundedLoans,
        totalFunded: fundedLoans.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch portfolio" },
    });
  }
});

export default router;
