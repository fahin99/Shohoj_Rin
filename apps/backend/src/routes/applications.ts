import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { requireRole } from "../middleware/authorize.js";
import { matchApplicationToLenders } from "../services/lender-matching.service.js";

const router = Router();

const createApplicationSchema = z.object({
  requestedAmount: z.number().positive("Amount must be positive"),
  durationMonths: z.number().int().positive("Duration must be a positive number of months"),
  purpose: z.string().min(1, "Purpose is required"),
  purposeDescription: z.string().optional(),
  partnerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  disbursementAccountId: z.string().uuid().optional(),
});

router.post("/", requireAuth, requireRole("borrower"), async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;

  const parsed = createApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Invalid application data",
        details: parsed.error.flatten(),
      },
    });
  }

  const {
    requestedAmount,
    durationMonths,
    purpose,
    purposeDescription,
    partnerId,
    productId,
    disbursementAccountId,
  } = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const profileResult = await client.query(
      `SELECT profile_completion_status FROM user_profiles WHERE user_id = $1`,
      [userId],
    );
    const profile = profileResult.rows[0];
    if (!profile) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error: { message: "Profile not found. Please complete onboarding first." },
      });
    }
    const trustResult = await client.query(
      `SELECT score_id FROM trust_scores WHERE user_id = $1 AND is_current = TRUE LIMIT 1`,
      [userId],
    );
    const trustScoreId = trustResult.rows[0]?.score_id ?? null;

    let resolvedPartnerId: string | null = partnerId ?? null;

    if (productId) {
      const productResult = await client.query(
        `SELECT partner_id, duration_months FROM loan_products WHERE product_id = $1 AND is_active = TRUE`,
        [productId],
      );
      if (productResult.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          error: { message: "Selected loan product is not available" },
        });
      }
      const product = productResult.rows[0];
      if (durationMonths > Number(product.duration_months)) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          error: { message: "Repayment duration exceeds the selected product limit" },
        });
      }
      if (partnerId && partnerId !== product.partner_id) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          error: { message: "Specified partner does not match the selected loan product" },
        });
      }
      resolvedPartnerId = partnerId ?? product.partner_id;
    }

    let resolvedDisbursementAccountId: string | null = null;
    if (disbursementAccountId) {
      const accountCheck = await client.query(
        `SELECT account_id FROM user_payment_accounts WHERE account_id = $1 AND user_id = $2 AND is_active = TRUE`,
        [disbursementAccountId, userId],
      );
      if (accountCheck.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          error: { message: "Invalid or inactive disbursement account selected" },
        });
      }
      resolvedDisbursementAccountId = disbursementAccountId;
    } else {
      const defaultAccount = await client.query(
        `SELECT account_id FROM user_payment_accounts WHERE user_id = $1 AND is_default = TRUE AND is_active = TRUE LIMIT 1`,
        [userId],
      );
      if (defaultAccount.rowCount && defaultAccount.rowCount > 0) {
        resolvedDisbursementAccountId = defaultAccount.rows[0].account_id;
      }
    }

    const appResult = await client.query(
      `INSERT INTO loan_applications
        (user_id, partner_id, product_id, requested_amount, duration_months, purpose, purpose_description, status, trust_score_id, submitted_at, disbursement_account_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'submitted', $8, NOW(), $9)
       RETURNING
        application_id AS "applicationId",
        reference_code AS "referenceCode",
        user_id AS "userId",
        partner_id AS "partnerId",
        product_id AS "productId",
        disbursement_account_id AS "disbursementAccountId",
        requested_amount AS "requestedAmount",
        duration_months AS "durationMonths",
        purpose,
        purpose_description AS "purposeDescription",
        status,
        submitted_at AS "submittedAt",
        created_at AS "createdAt"`,
      [
        userId,
        resolvedPartnerId,
        productId ?? null,
        requestedAmount,
        durationMonths,
        purpose,
        purposeDescription ?? null,
        trustScoreId,
        resolvedDisbursementAccountId,
      ],
    );

    const app = appResult.rows[0] as any;

    await matchApplicationToLenders(client, app.applicationId, purpose);

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      data: {
        ...app,
        requestedAmount: parseFloat(app.requestedAmount),
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to create application:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to create loan application" },
    });
  } finally {
    client.release();
  }
});

// GET /api/v1/applications — list user's applications
router.get("/", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;
  const role = authReq.auth!.role;

  try {
    const status = typeof req.query.status === "string" ? req.query.status : null;
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const offset = (page - 1) * limit;

    let whereClause: string;
    const params: (string | number)[] = [];
    let paramIdx = 1;

    if (role === "admin" || role === "partner_agent") {
      whereClause = "WHERE 1=1";
    } else {
      whereClause = `WHERE la.user_id = $${paramIdx++}`;
      params.push(userId);
    }

    if (status && status !== "all") {
      whereClause += ` AND la.status = $${paramIdx++}`;
      params.push(status);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM loan_applications la ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataParams = [...params, limit, offset];
    const result = await pool.query(
      `SELECT
        la.application_id AS "applicationId",
        la.reference_code AS "referenceCode",
        la.user_id AS "userId",
        COALESCE(la.partner_id, lp.partner_id) AS "partnerId",
        la.product_id AS "productId",
        la.disbursement_account_id AS "disbursementAccountId",
        la.requested_amount AS "requestedAmount",
        la.duration_months AS "durationMonths",
        la.purpose,
        la.purpose_description AS "purposeDescription",
        la.status,
        la.submitted_at AS "submittedAt",
        la.created_at AS "createdAt",
        la.updated_at AS "updatedAt",
        lp.name AS "productName",
        fp.name AS "partnerName",
        up.full_name AS "borrowerName",
        upa.account_name AS "disbursementAccountName",
        upa.account_number AS "disbursementAccountNumber",
        upa.provider AS "disbursementProvider",
        upa.account_type AS "disbursementAccountType"
       FROM loan_applications la
       LEFT JOIN loan_products lp ON lp.product_id = la.product_id
       LEFT JOIN funding_partners fp ON fp.partner_id = COALESCE(la.partner_id, lp.partner_id)
       LEFT JOIN user_profiles up ON up.user_id = la.user_id
       LEFT JOIN user_payment_accounts upa ON upa.account_id = la.disbursement_account_id
       ${whereClause}
       ORDER BY la.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      dataParams,
    );

    const applications = result.rows.map((row: any) => {
      const {
        disbursementAccountName,
        disbursementAccountNumber,
        disbursementProvider,
        disbursementAccountType,
        ...rest
      } = row;
      return {
        ...rest,
        requestedAmount: parseFloat(row.requestedAmount),
        disbursementAccount: row.disbursementAccountId
          ? {
              accountId: row.disbursementAccountId,
              accountName: disbursementAccountName,
              provider: disbursementProvider,
              accountType: disbursementAccountType,
              maskedAccountNumber: disbursementAccountNumber
                ? `****${disbursementAccountNumber.slice(-4)}`
                : null,
            }
          : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: { applications, total },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch applications" },
    });
  }
});

// GET /api/v1/applications/:id — get single application
router.get("/:id", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;
  const role = authReq.auth!.role;

  try {
    const result = await pool.query(
      `SELECT
        la.application_id AS "applicationId",
        la.reference_code AS "referenceCode",
        la.user_id AS "userId",
        COALESCE(la.partner_id, lp.partner_id) AS "partnerId",
        la.product_id AS "productId",
        la.disbursement_account_id AS "disbursementAccountId",
        la.requested_amount AS "requestedAmount",
        la.duration_months AS "durationMonths",
        la.purpose,
        la.purpose_description AS "purposeDescription",
        la.status,
        la.trust_score_id AS "trustScoreId",
        la.submitted_at AS "submittedAt",
        la.created_at AS "createdAt",
        la.updated_at AS "updatedAt",
        lp.name AS "productName",
        lp.interest_rate AS "interestRate",
        lp.duration_months AS "durationMonths",
        fp.name AS "partnerName",
        up.full_name AS "borrowerName",
        upa.account_name AS "disbursementAccountName",
        upa.account_number AS "disbursementAccountNumber",
        upa.provider AS "disbursementProvider",
        upa.account_type AS "disbursementAccountType",
        upa.bank_name AS "disbursementBankName",
        upa.branch_name AS "disbursementBranchName"
       FROM loan_applications la
       LEFT JOIN loan_products lp ON lp.product_id = la.product_id
       LEFT JOIN funding_partners fp ON fp.partner_id = COALESCE(la.partner_id, lp.partner_id)
       LEFT JOIN user_profiles up ON up.user_id = la.user_id
       LEFT JOIN user_payment_accounts upa ON upa.account_id = la.disbursement_account_id
       WHERE la.application_id = $1`,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Application not found" },
      });
    }

    const app = result.rows[0] as any;

    if (role === "borrower" && app.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: "Access denied" },
      });
    }

    if (role === "lender") {
      const accessCheck = await pool.query(
        `SELECT 1 FROM lender_application_matches WHERE application_id = $1 AND lender_user_id = $2
         UNION
         SELECT 1 FROM funding_commitments WHERE application_id = $1 AND lender_user_id = $2`,
        [req.params.id, userId],
      );
      if (accessCheck.rowCount === 0) {
        return res.status(403).json({
          success: false,
          error: { message: "Access denied" },
        });
      }
    }
    const historyResult = await pool.query(
      `SELECT
        pd.decision,
        pd.reason,
        pd.decided_at AS "decidedAt",
        u.username AS "decidedByUsername",
        u.role AS "decidedByRole"
      FROM partner_decisions pd
      JOIN users u ON u.user_id = pd.decided_by
      WHERE pd.application_id = $1
      ORDER BY pd.decided_at DESC`,
      [req.params.id],
    );

    const {
      disbursementAccountName,
      disbursementAccountNumber,
      disbursementProvider,
      disbursementAccountType,
      disbursementBankName,
      disbursementBranchName,
      ...restApp
    } = app;

    return res.status(200).json({
      success: true,
      data: {
        ...restApp,
        requestedAmount: parseFloat(app.requestedAmount),
        interestRate: app.interestRate ? parseFloat(app.interestRate) : null,
        disbursementAccount: app.disbursementAccountId
          ? {
              accountId: app.disbursementAccountId,
              accountName: disbursementAccountName,
              provider: disbursementProvider,
              accountType: disbursementAccountType,
              bankName: disbursementBankName,
              branchName: disbursementBranchName,
              maskedAccountNumber: disbursementAccountNumber
                ? `****${disbursementAccountNumber.slice(-4)}`
                : null,
            }
          : null,
        decisionHistory: historyResult.rows,
      },
    });
  } catch (error) {
    console.error("Failed to fetch application:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch application" },
    });
  }
});
// router.post("/draft", requireAuth, async (req, res) => {
//   const authReq = req as RequestWithAuth;
//   const userId = authReq.auth!.userId;

export default router;
