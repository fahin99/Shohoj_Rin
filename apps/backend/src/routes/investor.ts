import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { investorProfileSchema } from "@shohojrin/shared";
import {
  finalizeFullyFundedLoan,
  LoanFinalizationConfigError,
  ensureRepaymentSchedules,
} from "../services/loan-lifecycle.service.js";

const router = Router();

function requireLender(req: RequestWithAuth, res: any, next: any) {
  if (!req.auth || req.auth.role !== "lender") {
    return res.status(403).json({
      success: false,
      error: { message: "Investor/lender access required" },
    });
  }
  return next();
}

function formatInvestorProfile(row: any, company: any) {
  const {
    partnerAgentUsername,
    partnerAgentEmail,
    partnerAgentFullName,
    ...rest
  } = row;
  const partnerAgent = row.partnerAgentId
    ? {
        userId: row.partnerAgentId,
        username: partnerAgentUsername ?? null,
        email: partnerAgentEmail ?? null,
        fullName: partnerAgentFullName ?? null,
      }
    : null;
  return {
    ...rest,
    partnerAgent,
    company,
  };
}

async function fetchLenderCompany(userId: string) {
  const result = await pool.query(
    `SELECT
       fp.partner_id AS "partnerId",
       fp.name,
       fp.type,
       fp.address,
       fp.branch,
       fp.goal,
       fp.contact_email AS "contactEmail",
       fp.contact_phone AS "contactPhone",
       fp.is_active AS "isActive"
     FROM users u
     JOIN funding_partners fp ON fp.partner_id = u.partner_id
     WHERE u.user_id = $1`,
    [userId],
  );
  return result.rows[0] ?? null;
}

// GET /api/v1/investor/partner-agents — available active partner agents for this lender's institutional partner
router.get("/partner-agents", requireAuth, requireLender, async (req, res) => {
  const userId = (req as RequestWithAuth).auth!.userId;
  try {
    const lenderRow = await pool.query(
      `SELECT partner_id FROM users WHERE user_id = $1`,
      [userId],
    );
    const partnerId = lenderRow.rows[0]?.partner_id;
    if (!partnerId) {
      return res.status(200).json({ success: true, data: [] });
    }

    const agentsResult = await pool.query(
      `SELECT
         u.user_id AS "userId",
         u.username AS "username",
         u.email AS "email",
         up.full_name AS "fullName"
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.user_id
       WHERE u.role = 'partner_agent'
         AND u.account_status = 'active'
         AND u.partner_id = $1
       ORDER BY COALESCE(up.full_name, u.username, u.email) ASC`,
      [partnerId],
    );

    return res.status(200).json({ success: true, data: agentsResult.rows });
  } catch (error) {
    console.error("Failed to fetch partner agents:", error);
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to fetch partner agents" } });
  }
});

router.get("/profile", requireAuth, requireLender, async (req, res) => {
  const userId = (req as RequestWithAuth).auth!.userId;

  try {
    const result = await pool.query(
      `SELECT
         ip.investor_profile_id AS "investorProfileId",
         ip.user_id AS "userId",
         u.username AS "username",
         ip.display_name AS "displayName",
         ip.partner_agent_id AS "partnerAgentId",
         ip.verification_status AS "verificationStatus",
         ip.funding_capacity AS "fundingCapacity",
         ip.preferred_categories AS "preferredCategories",
         ip.risk_preference AS "riskPreference",
         ip.max_exposure AS "maxExposure",
         ip.account_status AS "accountStatus",
         ip.kyc_status AS "kycStatus",
         ip.created_at AS "createdAt",
         ip.updated_at AS "updatedAt",
         agent_u.username AS "partnerAgentUsername",
         agent_u.email AS "partnerAgentEmail",
         agent_up.full_name AS "partnerAgentFullName"
       FROM investor_profiles ip
       JOIN users u ON u.user_id = ip.user_id
       LEFT JOIN users agent_u ON agent_u.user_id = ip.partner_agent_id
       LEFT JOIN user_profiles agent_up ON agent_up.user_id = agent_u.user_id
       WHERE ip.user_id = $1`,
      [userId],
    );

    const company = await fetchLenderCompany(userId);

    if (result.rowCount === 0) {
      await pool.query(
        `INSERT INTO investor_profiles (user_id, verification_status, kyc_status, account_status)
         VALUES ($1, 'pending', 'incomplete', 'active')
         ON CONFLICT (user_id) DO NOTHING`,
        [userId],
      );
      const inserted = await pool.query(
        `SELECT
           ip.investor_profile_id AS "investorProfileId",
           ip.user_id AS "userId",
           u.username AS "username",
           ip.display_name AS "displayName",
           ip.partner_agent_id AS "partnerAgentId",
           ip.verification_status AS "verificationStatus",
           ip.funding_capacity AS "fundingCapacity",
           ip.preferred_categories AS "preferredCategories",
           ip.risk_preference AS "riskPreference",
           ip.max_exposure AS "maxExposure",
           ip.account_status AS "accountStatus",
           ip.kyc_status AS "kycStatus",
           ip.created_at AS "createdAt",
           ip.updated_at AS "updatedAt",
           agent_u.username AS "partnerAgentUsername",
           agent_u.email AS "partnerAgentEmail",
           agent_up.full_name AS "partnerAgentFullName"
         FROM investor_profiles ip
         JOIN users u ON u.user_id = ip.user_id
         LEFT JOIN users agent_u ON agent_u.user_id = ip.partner_agent_id
         LEFT JOIN user_profiles agent_up ON agent_up.user_id = agent_u.user_id
         WHERE ip.user_id = $1`,
        [userId],
      );
      return res.status(200).json({ success: true, data: formatInvestorProfile(inserted.rows[0], company) });
    }

    return res.status(200).json({ success: true, data: formatInvestorProfile(result.rows[0], company) });
  } catch (error) {
    console.error("Failed to fetch investor profile:", error);
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to fetch investor profile" } });
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
    const invalid = data.preferredCategories.filter(
      (category) => !allowedCategories.includes(category),
    );
    if (invalid.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: `Unsupported category values: ${invalid.join(", ")}` },
      });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (data.username !== undefined) {
      const newUsername = data.username.trim();
      const existing = await client.query(
        `SELECT user_id FROM users WHERE LOWER(username) = LOWER($1) AND user_id != $2 LIMIT 1`,
        [newUsername, userId],
      );
      if (existing.rowCount && existing.rowCount > 0) {
        await client.query("ROLLBACK");
        return res
          .status(409)
          .json({ success: false, error: { message: "This username is already taken" } });
      }
      await client.query(`UPDATE users SET username = $1, updated_at = NOW() WHERE user_id = $2`, [
        newUsername,
        userId,
      ]);
    }

    if (data.companyName) {
      const companyName = data.companyName.trim().replace(/\s+/g, " ");
      const partnerResult = await client.query(
        `INSERT INTO funding_partners (name, type, address, branch, goal)
         VALUES ($1, 'other', $2, $3, $4)
         ON CONFLICT ((lower(regexp_replace(btrim(name), '\\s+', ' ', 'g'))))
         DO UPDATE SET
           address = COALESCE(EXCLUDED.address, funding_partners.address),
           branch = COALESCE(EXCLUDED.branch, funding_partners.branch),
           goal = COALESCE(EXCLUDED.goal, funding_partners.goal)
         RETURNING partner_id`,
        [
          companyName,
          data.companyAddress ?? null,
          data.companyBranch ?? null,
          data.companyGoal ?? null,
        ],
      );
      const partnerId: string = partnerResult.rows[0].partner_id;

      await client.query(`UPDATE users SET partner_id = $1 WHERE user_id = $2`, [
        partnerId,
        userId,
      ]);
    }

    let partnerAgentId: string | null | undefined = undefined;
    if (data.partnerAgentId !== undefined) {
      if (!data.partnerAgentId) {
        partnerAgentId = null;
      } else {
        const lenderCheck = await client.query(
          `SELECT partner_id FROM users WHERE user_id = $1`,
          [userId],
        );
        const effectivePartnerId = lenderCheck.rows[0]?.partner_id;
        if (!effectivePartnerId) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            success: false,
            error: { message: "Cannot assign a partner agent without an institutional partner" },
          });
        }

        const agentCheck = await client.query(
          `SELECT user_id, role, account_status, partner_id FROM users WHERE user_id = $1`,
          [data.partnerAgentId],
        );
        if (
          agentCheck.rowCount === 0 ||
          agentCheck.rows[0].role !== "partner_agent" ||
          agentCheck.rows[0].account_status !== "active" ||
          agentCheck.rows[0].partner_id !== effectivePartnerId
        ) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            success: false,
            error: {
              message:
                "Selected partner agent is invalid, inactive, or belongs to a different institution",
            },
          });
        }
        partnerAgentId = data.partnerAgentId;
      }
    }

    const result = await client.query(
      `INSERT INTO investor_profiles (
         user_id, display_name, funding_capacity, preferred_categories,
         risk_preference, max_exposure, partner_agent_id, verification_status, kyc_status, account_status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 'incomplete', 'active')
       ON CONFLICT (user_id) DO UPDATE SET
         display_name = COALESCE(EXCLUDED.display_name, investor_profiles.display_name),
         funding_capacity = COALESCE(EXCLUDED.funding_capacity, investor_profiles.funding_capacity),
         preferred_categories = COALESCE(EXCLUDED.preferred_categories, investor_profiles.preferred_categories),
         risk_preference = COALESCE(EXCLUDED.risk_preference, investor_profiles.risk_preference),
         max_exposure = COALESCE(EXCLUDED.max_exposure, investor_profiles.max_exposure),
         partner_agent_id = CASE WHEN $8::boolean THEN EXCLUDED.partner_agent_id ELSE investor_profiles.partner_agent_id END,
         updated_at = NOW()
       RETURNING
         investor_profile_id AS "investorProfileId",
         user_id AS "userId",
         display_name AS "displayName",
         partner_agent_id AS "partnerAgentId",
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
        partnerAgentId ?? null,
        partnerAgentId !== undefined,
      ],
    );

    const userRow = await client.query(`SELECT username FROM users WHERE user_id = $1`, [userId]);
    const username = userRow.rows[0]?.username ?? null;

    const savedPartnerAgentId = result.rows[0].partnerAgentId;
    let partnerAgent: any = null;
    if (savedPartnerAgentId) {
      const agentUserRow = await client.query(
        `SELECT u.username, u.email, up.full_name AS "fullName"
         FROM users u
         LEFT JOIN user_profiles up ON up.user_id = u.user_id
         WHERE u.user_id = $1`,
        [savedPartnerAgentId],
      );
      if (agentUserRow.rowCount && agentUserRow.rowCount > 0) {
        partnerAgent = {
          userId: savedPartnerAgentId,
          username: agentUserRow.rows[0].username ?? null,
          email: agentUserRow.rows[0].email ?? null,
          fullName: agentUserRow.rows[0].fullName ?? null,
        };
      }
    }

    await client.query("COMMIT");

    const company = await fetchLenderCompany(userId);
    return res.status(200).json({
      success: true,
      data: { ...result.rows[0], partnerAgent, username, company },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to update investor profile:", error);
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to update investor profile" } });
  } finally {
    client.release();
  }
});

// GET /api/v1/investor/opportunities — applications matched to this lender, priority-ordered.
router.get("/opportunities", requireAuth, requireLender, async (req, res) => {
  const userId = (req as RequestWithAuth).auth!.userId;

  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT
         lam.match_id AS "matchId",
         lam.priority,
         lam.status AS "matchStatus",
         lam.matched_at AS "matchedAt",
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
           WHERE vr.user_id = la.user_id AND vr.verification_type = 'income' AND vr.status = 'approved'
         ) AS "incomeVerified",
         EXISTS (
           SELECT 1 FROM verification_requests vr
           WHERE vr.user_id = la.user_id AND vr.verification_type = 'address' AND vr.status = 'approved'
         ) AS "addressVerified",
         EXISTS (
           SELECT 1 FROM verification_requests vr
           WHERE vr.user_id = la.user_id AND vr.verification_type = 'identity' AND vr.status = 'approved'
         ) AS "identityVerified",
         COALESCE((
           SELECT SUM(fc.amount) FROM funding_commitments fc
           WHERE fc.application_id = la.application_id AND fc.status = 'committed'
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
       FROM lender_application_matches lam
       JOIN loan_applications la ON la.application_id = lam.application_id
       LEFT JOIN loan_products lp ON lp.product_id = la.product_id
       LEFT JOIN funding_partners fp ON fp.partner_id = COALESCE(la.partner_id, lp.partner_id)
       LEFT JOIN trust_scores ts ON ts.score_id = la.trust_score_id
       LEFT JOIN user_profiles up ON up.user_id = la.user_id
       WHERE lam.lender_user_id = $1
         AND lam.status IN ('pending', 'viewed')
         AND la.status IN ('submitted', 'under_review', 'approved')
         AND la.requested_amount > COALESCE((
           SELECT SUM(fc.amount) FROM funding_commitments fc
           WHERE fc.application_id = la.application_id AND fc.status = 'committed'
         ), 0)
       ORDER BY lam.priority ASC, la.submitted_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );

    if (result.rowCount && result.rowCount > 0) {
      const matchIds = result.rows.map((row: any) => row.matchId);
      await pool.query(
        `UPDATE lender_application_matches
         SET status = 'viewed', viewed_at = NOW()
         WHERE match_id = ANY($1::uuid[]) AND status = 'pending'`,
        [matchIds],
      );
    }

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
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to fetch opportunities" } });
  }
});

router.post("/fund/:applicationId", requireAuth, requireLender, async (req, res) => {
  const userId = (req as RequestWithAuth).auth!.userId;
  const applicationId = String(req.params.applicationId);
  const parsed = z.object({ amount: z.number().finite().positive() }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { message: "Invalid funding amount" } });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const matchResult = await client.query(
      `SELECT match_id, status FROM lender_application_matches
       WHERE application_id = $1 AND lender_user_id = $2
       FOR UPDATE`,
      [applicationId, userId],
    );
    if (matchResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, error: { message: "This application is not available to you" } });
    }
    if (matchResult.rows[0].status === "accepted") {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ success: false, error: { message: "You have already accepted this application" } });
    }
    if (matchResult.rows[0].status === "rejected") {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ success: false, error: { message: "You have already rejected this application" } });
    }

    const appResult = await client.query(
      `SELECT la.application_id, la.user_id, la.status, la.partner_id, la.requested_amount,
              la.disbursement_account_id, upa.provider, upa.account_type
       FROM loan_applications la
       LEFT JOIN user_payment_accounts upa ON upa.account_id = la.disbursement_account_id AND upa.is_active = TRUE
       WHERE la.application_id = $1
      FOR UPDATE OF la`,
      [applicationId],
    );

    if (appResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: { message: "Application not found" } });
    }

    const app = appResult.rows[0] as any;
    if (!["submitted", "under_review", "approved"].includes(app.status)) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ success: false, error: { message: "Application is not eligible for funding" } });
    }

    let disbursementAccountId = app.disbursement_account_id || null;
    let disbursementProvider = app.provider || null;
    if (!disbursementAccountId) {
      const defaultAcc = await client.query(
        `SELECT account_id, provider FROM user_payment_accounts WHERE user_id = $1 AND is_default = TRUE AND is_active = TRUE LIMIT 1`,
        [app.user_id],
      );
      if (defaultAcc.rows.length > 0) {
        disbursementAccountId = defaultAcc.rows[0].account_id;
        disbursementProvider = defaultAcc.rows[0].provider;
      }
    }
    const disbursementMethod = disbursementProvider || "platform_transfer";

    const existingCommitment = await client.query(
      `SELECT commitment_id
       FROM funding_commitments
       WHERE application_id = $1 AND lender_user_id = $2
       FOR UPDATE`,
      [applicationId, userId],
    );
    if (existingCommitment.rowCount) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ success: false, error: { message: "You have already funded this application" } });
    }

    const committedResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS committed_amount
       FROM funding_commitments
       WHERE application_id = $1 AND status = 'committed'`,
      [applicationId],
    );
    const remainingAmount =
      Math.round(
        (Number(app.requested_amount) - Number(committedResult.rows[0].committed_amount)) * 100,
      ) / 100;
    const fundingAmount = Math.round(parsed.data.amount * 100) / 100;

    if (fundingAmount <= 0 || fundingAmount > remainingAmount) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({
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
    const totalCommittedAmount = Number(committedResult.rows[0].committed_amount) + fundingAmount;
    const isFullFunding = totalCommittedAmount >= Number(app.requested_amount);

    let loanId: string | null = null;
    let applicationStatus = app.status;

    if (isFullFunding) {
      const finalized = await finalizeFullyFundedLoan(client, {
        applicationId,
        funderUserId: userId,
        disbursementAccountId,
        disbursementMethod,
      });
      loanId = finalized.loanId;
      applicationStatus = finalized.applicationStatus;
    }

    await client.query(
      `UPDATE lender_application_matches
       SET status = 'accepted', decided_at = NOW()
       WHERE match_id = $1`,
      [matchResult.rows[0].match_id],
    );

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, after_state)
       VALUES ($1, 'funding_commitment_created', 'funding_commitment', $2,
               jsonb_build_object('applicationId', $3::uuid, 'amount', $4::numeric, 'status', 'committed'))`,
      [userId, commitment.commitment_id, applicationId, fundingAmount],
    );

    await client.query(
      `INSERT INTO notifications (user_id, channel, type, title, body)
       VALUES ($1, 'in_app', 'loan_decision', 'A lender accepted your application',
               'A lender has committed funding to your loan application. Check your applications for details.')`,
      [app.user_id],
    );

    await client.query("COMMIT");
    return res.status(200).json({
      success: true,
      data: {
        applicationId,
        commitmentId: commitment.commitment_id,
        fundedAmount: Number(commitment.amount),
        status: commitment.status,
        applicationStatus,
        loanId,
        loanStatus: isFullFunding ? "active" : undefined,
        fundedAt: commitment.created_at,
        message: isFullFunding
          ? "Application fully funded and loan disbursed"
          : "Funding commitment recorded",
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof LoanFinalizationConfigError) {
      return res.status(error.statusCode).json({
        success: false,
        error: { message: error.message },
      });
    }
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      return res
        .status(409)
        .json({ success: false, error: { message: "You have already funded this application" } });
    }
    console.error("Failed to fund opportunity:", error);
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to record funding commitment" } });
  } finally {
    client.release();
  }
});

router.post("/applications/:applicationId/reject", requireAuth, requireLender, async (req, res) => {
  const userId = (req as RequestWithAuth).auth!.userId;
  const applicationId = req.params.applicationId;
  const parsed = z
    .object({ reason: z.string().trim().max(500).optional() })
    .safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { message: "Invalid request" } });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const matchResult = await client.query(
      `SELECT match_id, status FROM lender_application_matches
       WHERE application_id = $1 AND lender_user_id = $2
       FOR UPDATE`,
      [applicationId, userId],
    );
    if (matchResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ success: false, error: { message: "This application is not available to you" } });
    }
    if (matchResult.rows[0].status === "accepted") {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ success: false, error: { message: "You have already accepted this application" } });
    }

    await client.query(
      `UPDATE lender_application_matches
       SET status = 'rejected', decided_at = NOW(), decision_reason = $2
       WHERE match_id = $1`,
      [matchResult.rows[0].match_id, parsed.data.reason ?? null],
    );

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, after_state)
       VALUES ($1, 'lender_application_rejected', 'loan_application', $2, jsonb_build_object('reason', $3::text))`,
      [userId, applicationId, parsed.data.reason ?? null],
    );

    await client.query("COMMIT");
    return res.status(200).json({ success: true, data: { applicationId, status: "rejected" } });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to reject application:", error);
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to reject application" } });
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
        up.full_name AS "borrowerName",
        lp.name AS "productName",
        lp.category,
        lp.interest_rate AS "interestRate",
        lp.duration_months AS "durationMonths",
        fp.name AS "partnerName",
        ts.trust_band AS "trustBand",
        l.loan_id AS "loanId",
        l.status AS "loanStatus",
        l.principal_amount AS "principalAmount",
        rs."totalExpected",
        rs."totalPaid",
        rs."nextDueDate"
       FROM funding_commitments fc
       JOIN loan_applications la ON la.application_id = fc.application_id
       LEFT JOIN user_profiles up ON up.user_id = la.user_id
       LEFT JOIN loan_products lp ON lp.product_id = la.product_id
       LEFT JOIN funding_partners fp ON fp.partner_id = COALESCE(la.partner_id, lp.partner_id)
       LEFT JOIN trust_scores ts ON ts.score_id = la.trust_score_id
       LEFT JOIN loans l ON l.application_id = la.application_id
       LEFT JOIN LATERAL (
         SELECT
           COALESCE(SUM(rsched.expected_amount), 0) AS "totalExpected",
           COALESCE((
             SELECT SUM(r.amount_paid)
             FROM repayments r
             WHERE r.schedule_id IN (
               SELECT schedule_id FROM repayment_schedules WHERE loan_id = l.loan_id
             )
               AND r.status = 'completed'
           ), 0) AS "totalPaid",
           MIN(rsched.due_date) FILTER (WHERE rsched.status IN ('pending', 'overdue', 'partially_paid')) AS "nextDueDate"
         FROM repayment_schedules rsched
         WHERE rsched.loan_id = l.loan_id
       ) rs ON TRUE
       WHERE fc.lender_user_id = $1
         AND fc.status = 'committed'
       ORDER BY fc.created_at DESC`,
      [userId],
    );

    const fundedLoans = fundedResult.rows.map((row: any) => {
      const totalExpected = Number(row.totalExpected || 0);
      const totalPaid = Number(row.totalPaid || 0);
      return {
        ...row,
        fundedAmount: Number(row.fundedAmount || 0),
        requestedAmount: Number(row.requestedAmount || 0),
        interestRate: row.interestRate == null ? null : Number(row.interestRate),
        durationMonths: row.durationMonths == null ? null : Number(row.durationMonths),
        principalAmount: row.principalAmount == null ? null : Number(row.principalAmount),
        totalExpected,
        totalPaid,
        remainingAmount: Math.max(0, Math.round((totalExpected - totalPaid) * 100) / 100),
        repaidPct: totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0,
        nextDueDate: row.nextDueDate ?? null,
      };
    });

    const totalDeployed = fundedLoans.reduce(
      (sum: number, loan: any) => sum + loan.fundedAmount,
      0,
    );
    const activeLoans = fundedLoans.filter((loan: any) => loan.loanStatus === "active").length;
    const totalExpected = fundedLoans.reduce(
      (sum: number, loan: any) => sum + loan.totalExpected,
      0,
    );
    const totalPaid = fundedLoans.reduce((sum: number, loan: any) => sum + loan.totalPaid, 0);
    const weightedYield = fundedLoans.reduce(
      (sum: number, loan: any) => sum + (Number(loan.interestRate) || 0) * loan.fundedAmount,
      0,
    );
    const averageYield =
      totalDeployed > 0 ? Math.round((weightedYield / totalDeployed) * 100) / 100 : 0;
    const repaymentRate =
      totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 10000) / 100 : 0;
    const atRiskExposure = fundedLoans
      .filter((loan: any) => ["overdue", "delinquent", "defaulted"].includes(loan.loanStatus))
      .reduce((sum: number, loan: any) => sum + loan.remainingAmount, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalDeployed,
        activeLoans,
        averageYield,
        repaymentRate,
        atRiskExposure: Math.round(atRiskExposure * 100) / 100,
        fundedLoans,
        totalFunded: fundedLoans.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    return res
      .status(500)
      .json({ success: false, error: { message: "Failed to fetch portfolio" } });
  }
});

export default router;
