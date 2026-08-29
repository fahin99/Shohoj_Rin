import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";

const router = Router();

const createApplicationSchema = z.object({
  requestedAmount: z.number().positive("Amount must be positive"),
  purpose: z.string().min(1, "Purpose is required"),
  purposeDescription: z.string().optional(),
  partnerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
});

// POST /api/v1/applications — create loan application
router.post("/", requireAuth, async (req, res) => {
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

  const { requestedAmount, purpose, purposeDescription, partnerId, productId } = parsed.data;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check profile completion
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

    // Snapshot current trust score
    const trustResult = await client.query(
      `SELECT score_id FROM trust_scores WHERE user_id = $1 AND is_current = TRUE LIMIT 1`,
      [userId],
    );
    const trustScoreId = trustResult.rows[0]?.score_id ?? null;

    // Resolve partner from product if not directly specified
    let resolvedPartnerId = partnerId ?? null;
    if (!resolvedPartnerId && productId) {
      const productResult = await client.query(
        `SELECT partner_id FROM loan_products WHERE product_id = $1`,
        [productId],
      );
      resolvedPartnerId = productResult.rows[0]?.partner_id ?? null;
    }

    const appResult = await client.query(
      `INSERT INTO loan_applications
        (user_id, partner_id, product_id, requested_amount, purpose, purpose_description, status, trust_score_id, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'submitted', $7, NOW())
       RETURNING
        application_id AS "applicationId",
        user_id AS "userId",
        partner_id AS "partnerId",
        product_id AS "productId",
        requested_amount AS "requestedAmount",
        purpose,
        purpose_description AS "purposeDescription",
        status,
        submitted_at AS "submittedAt",
        created_at AS "createdAt"`,
      [userId, resolvedPartnerId, productId ?? null, requestedAmount, purpose, purposeDescription ?? null, trustScoreId],
    );

    await client.query("COMMIT");

    const app = appResult.rows[0] as any;
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
        la.user_id AS "userId",
        la.partner_id AS "partnerId",
        la.product_id AS "productId",
        la.requested_amount AS "requestedAmount",
        la.purpose,
        la.purpose_description AS "purposeDescription",
        la.status,
        la.submitted_at AS "submittedAt",
        la.created_at AS "createdAt",
        la.updated_at AS "updatedAt",
        lp.name AS "productName",
        fp.name AS "partnerName",
        up.full_name AS "borrowerName"
       FROM loan_applications la
       LEFT JOIN loan_products lp ON lp.product_id = la.product_id
       LEFT JOIN funding_partners fp ON fp.partner_id = la.partner_id
       LEFT JOIN user_profiles up ON up.user_id = la.user_id
       ${whereClause}
       ORDER BY la.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      dataParams,
    );

    const applications = result.rows.map((row: any) => ({
      ...row,
      requestedAmount: parseFloat(row.requestedAmount),
    }));

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
        la.user_id AS "userId",
        la.partner_id AS "partnerId",
        la.product_id AS "productId",
        la.requested_amount AS "requestedAmount",
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
        up.full_name AS "borrowerName"
       FROM loan_applications la
       LEFT JOIN loan_products lp ON lp.product_id = la.product_id
       LEFT JOIN funding_partners fp ON fp.partner_id = la.partner_id
       LEFT JOIN user_profiles up ON up.user_id = la.user_id
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

    // Ownership check: borrowers can only see their own
    if (role === "borrower" && app.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: "Access denied" },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...app,
        requestedAmount: parseFloat(app.requestedAmount),
        interestRate: app.interestRate ? parseFloat(app.interestRate) : null,
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

export default router;
