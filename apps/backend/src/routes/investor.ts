import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { investorProfileSchema } from "@shohojrin/shared";
import { calculateReducingBalanceSchedule } from "../services/interest.service.js";

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

async function ensureRepaymentSchedules(
  client: Pick<import("pg").PoolClient, "query">,
  loanId: string,
  principal: number,
  interestRate: number,
  tenureMonths: number,
  startDate: Date | string,
) {
  const existing = await client.query(
    `SELECT 1 FROM repayment_schedules WHERE loan_id = $1 LIMIT 1`,
    [loanId],
  );
  if (existing.rowCount) return;

  const schedule = calculateReducingBalanceSchedule(
    principal,
    interestRate,
    tenureMonths,
    new Date(startDate),
  );
  for (const item of schedule) {
    await client.query(
      `INSERT INTO repayment_schedules (loan_id, installment_number, due_date, expected_amount, status)
       VALUES ($1, $2, $3, $4, 'pending')`,
      [loanId, item.installmentNumber, item.dueDate.toISOString().split("T")[0], Number(item.totalInstallment)],
    );
  }
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

    const company = await fetchLenderCompany(userId);

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
      return res.status(200).json({ success: true, data: { ...insert.rows[0], company } });
    }

    return res.status(200).json({ success: true, data: { ...result.rows[0], company } });
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

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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
        [companyName, data.companyAddress ?? null, data.companyBranch ?? null, data.companyGoal ?? null],
      );
      const partnerId: string = partnerResult.rows[0].partner_id;

      await client.query(`UPDATE users SET partner_id = $1 WHERE user_id = $2`, [partnerId, userId]);
    }

    const result = await client.query(
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

    await client.query("COMMIT");

    const company = await fetchLenderCompany(userId);
    return res.status(200).json({ success: true, data: { ...result.rows[0], company } });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to update investor profile:", error);
    return res.status(500).json({ success: false, error: { message: "Failed to update investor profile" } });
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
       LEFT JOIN funding_partners fp ON fp.partner_id = la.partner_id
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

    const matchResult = await client.query(
      `SELECT match_id, status FROM lender_application_matches
       WHERE application_id = $1 AND lender_user_id = $2
       FOR UPDATE`,
      [applicationId, userId],
    );
    if (matchResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: { message: "This application is not available to you" } });
    }
    if (matchResult.rows[0].status === "accepted") {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, error: { message: "You have already accepted this application" } });
    }
    if (matchResult.rows[0].status === "rejected") {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, error: { message: "You have already rejected this application" } });
    }

    const appResult = await client.query(
      `SELECT application_id, user_id, status, partner_id, requested_amount
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
    const totalCommittedAmount = Number(committedResult.rows[0].committed_amount) + fundingAmount;
    const applicationStatus = totalCommittedAmount >= Number(app.requested_amount) ? "approved" : app.status;

    if (applicationStatus === "approved" && app.status !== "approved") {
      await client.query(
        `UPDATE loan_applications SET status = 'approved', updated_at = NOW() WHERE application_id = $1`,
        [applicationId],
      );
    }

    let loanId: string | null = null;
    if (applicationStatus === "approved") {
      const existingLoan = await client.query(
        `SELECT loan_id FROM loans WHERE application_id = $1 FOR UPDATE`,
        [applicationId],
      );

      if (existingLoan.rowCount === 0) {
        const partnerResult = await client.query(
          `SELECT COALESCE(la.partner_id, u.partner_id) AS partner_id
           FROM loan_applications la
           LEFT JOIN users u ON u.user_id = $2
           WHERE la.application_id = $1`,
          [applicationId, userId],
        );
        const partnerId = partnerResult.rows[0]?.partner_id;
        if (!partnerId) {
          throw new Error("Unable to determine a funding partner for this application");
        }

        const productResult = await client.query(
          `SELECT lp.interest_rate, lp.duration_months
           FROM loan_applications la
           LEFT JOIN loan_products lp ON lp.product_id = la.product_id
           WHERE la.application_id = $1`,
          [applicationId],
        );
        const interestRate = Number(productResult.rows[0]?.interest_rate ?? 12);
        const tenureMonths = Number(productResult.rows[0]?.duration_months ?? 12);
        const principal = Number(app.requested_amount);
        const startDate = new Date();
        const expectedEndDate = new Date(startDate);
        expectedEndDate.setMonth(expectedEndDate.getMonth() + tenureMonths);

        const offerResult = await client.query(
          `INSERT INTO loan_offers
            (application_id, partner_id, offered_amount, interest_rate, tenure_months, conditions, status, offered_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'accepted', NOW())
           RETURNING offer_id`,
          [applicationId, partnerId, principal, interestRate, tenureMonths, "Standard terms"],
        );
        const loanResult = await client.query(
          `INSERT INTO loans
            (application_id, offer_id, user_id, partner_id, principal_amount, interest_rate, tenure_months, status, start_date, expected_end_date)
           SELECT $1, $2, la.user_id, $3, $4, $5, $6, 'pending_disbursement', $7, $8
           FROM loan_applications la
           WHERE la.application_id = $1
           RETURNING loan_id`,
          [
            applicationId,
            offerResult.rows[0].offer_id,
            partnerId,
            principal,
            interestRate,
            tenureMonths,
            startDate.toISOString().split("T")[0],
            expectedEndDate.toISOString().split("T")[0],
          ],
        );
        loanId = loanResult.rows[0].loan_id;
        if (!loanId) {
          throw new Error("Loan was not created");
        }

        await client.query(
          `INSERT INTO loan_disbursements
            (loan_id, amount, disbursement_method, reference_number, disbursed_at)
           VALUES ($1, $2, 'platform_transfer', $3, NOW())`,
          [loanId, principal, `AUTO-${applicationId}`],
        );
        await client.query(
          `UPDATE loans SET status = 'active', updated_at = NOW() WHERE loan_id = $1`,
          [loanId],
        );
        await client.query(
          `UPDATE loan_applications SET status = 'disbursed', updated_at = NOW() WHERE application_id = $1`,
          [applicationId],
        );
        await ensureRepaymentSchedules(
          client,
          loanId,
          principal,
          interestRate,
          tenureMonths,
          startDate,
        );

        await client.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, after_state)
           VALUES ($1, 'loan_created', 'loan', $2, jsonb_build_object('applicationId', $3::uuid, 'principalAmount', $4::numeric, 'tenureMonths', $5::integer, 'status', 'active'))`,
          [userId, loanId, applicationId, principal, tenureMonths],
        );
      } else {
        loanId = existingLoan.rows[0].loan_id;
      }
      if (!loanId) {
        throw new Error("Loan was not found after funding");
      }

      const loanState = await client.query(
        `SELECT principal_amount, interest_rate, tenure_months, start_date, status
         FROM loans WHERE loan_id = $1 FOR UPDATE`,
        [loanId],
      );
      if (loanState.rows[0]?.status === "pending_disbursement") {
        const disbursementResult = await client.query(
          `SELECT COALESCE(SUM(amount), 0) AS total_disbursed
           FROM loan_disbursements
           WHERE loan_id = $1`,
          [loanId],
        );
        const principalAmount = Number(loanState.rows[0].principal_amount);
        if (Number(disbursementResult.rows[0].total_disbursed) < principalAmount) {
          await client.query(
            `INSERT INTO loan_disbursements
              (loan_id, amount, disbursement_method, reference_number, disbursed_at)
             VALUES ($1, $2, 'platform_transfer', $3, NOW())`,
            [loanId, principalAmount, `AUTO-${applicationId}`],
          );
          await client.query(
            `UPDATE loans SET status = 'active', updated_at = NOW() WHERE loan_id = $1`,
            [loanId],
          );
          await client.query(
            `UPDATE loan_applications SET status = 'disbursed', updated_at = NOW() WHERE application_id = $1`,
            [applicationId],
          );
        }
        await ensureRepaymentSchedules(
          client,
          loanId,
          principalAmount,
          Number(loanState.rows[0].interest_rate),
          Number(loanState.rows[0].tenure_months),
          loanState.rows[0].start_date,
        );
      }
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

router.post("/applications/:applicationId/reject", requireAuth, requireLender, async (req, res) => {
  const userId = (req as RequestWithAuth).auth!.userId;
  const applicationId = req.params.applicationId;
  const parsed = z.object({ reason: z.string().trim().max(500).optional() }).safeParse(req.body ?? {});
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
      return res.status(404).json({ success: false, error: { message: "This application is not available to you" } });
    }
    if (matchResult.rows[0].status === "accepted") {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, error: { message: "You have already accepted this application" } });
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
    return res.status(500).json({ success: false, error: { message: "Failed to reject application" } });
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
       LEFT JOIN funding_partners fp ON fp.partner_id = la.partner_id
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

    const totalDeployed = fundedLoans.reduce((sum: number, loan: any) => sum + loan.fundedAmount, 0);
    const activeLoans = fundedLoans.filter((loan: any) => loan.loanStatus === "active").length;
    const totalExpected = fundedLoans.reduce((sum: number, loan: any) => sum + loan.totalExpected, 0);
    const totalPaid = fundedLoans.reduce((sum: number, loan: any) => sum + loan.totalPaid, 0);
    const weightedYield = fundedLoans.reduce(
      (sum: number, loan: any) => sum + (Number(loan.interestRate) || 0) * loan.fundedAmount,
      0,
    );
    const averageYield = totalDeployed > 0 ? Math.round((weightedYield / totalDeployed) * 100) / 100 : 0;
    const repaymentRate = totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 10000) / 100 : 0;
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
    return res.status(500).json({ success: false, error: { message: "Failed to fetch portfolio" } });
  }
});

export default router;