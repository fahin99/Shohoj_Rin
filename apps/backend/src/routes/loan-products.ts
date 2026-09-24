import { Router } from "express";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";

const router = Router();

// GET /api/v1/loan-products — list active loan products
router.get("/", async (req, res) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : null;
    const search = typeof req.query.search === "string" ? req.query.search : null;
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const offset = (page - 1) * limit;

    let whereClause = "WHERE lp.is_active = TRUE";
    const params: (string | number)[] = [];
    let paramIdx = 1;

    if (category && category !== "all") {
      whereClause += ` AND lp.category = $${paramIdx++}`;
      params.push(category);
    }

    if (search) {
      whereClause += ` AND (lp.name ILIKE $${paramIdx} OR lp.description ILIKE $${paramIdx} OR fp.name ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM loan_products lp
       JOIN funding_partners fp ON fp.partner_id = lp.partner_id
       ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataParams = [...params, limit, offset];
    const result = await pool.query(
      `SELECT
        lp.product_id AS "id",
        lp.name,
        fp.name AS "provider",
        lp.partner_id AS "partnerId",
        lp.category,
        lp.min_amount AS "minAmount",
        lp.max_amount AS "maxAmount",
        lp.interest_rate AS "interestRate",
        lp.duration_months AS "durationMonths",
        lp.description,
        lp.eligibility,
        lp.tags,
        lp.is_active AS "isActive"
       FROM loan_products lp
       JOIN funding_partners fp ON fp.partner_id = lp.partner_id
       ${whereClause}
       ORDER BY lp.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      dataParams,
    );

    const products = result.rows.map((row: any) => ({
      ...row,
      minAmount: parseFloat(row.minAmount),
      maxAmount: parseFloat(row.maxAmount),
      interestRate: parseFloat(row.interestRate),
      eligibility: Array.isArray(row.eligibility) ? row.eligibility : [],
      tags: Array.isArray(row.tags) ? row.tags : [],
    }));

    return res.status(200).json({
      success: true,
      data: { products, total },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch loan products:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch loan products" },
    });
  }
});

// GET /api/v1/loan-products/:id — get single product
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        lp.product_id AS "id",
        lp.name,
        fp.name AS "provider",
        lp.partner_id AS "partnerId",
        lp.category,
        lp.min_amount AS "minAmount",
        lp.max_amount AS "maxAmount",
        lp.interest_rate AS "interestRate",
        lp.duration_months AS "durationMonths",
        lp.description,
        lp.eligibility,
        lp.tags,
        lp.is_active AS "isActive"
       FROM loan_products lp
       JOIN funding_partners fp ON fp.partner_id = lp.partner_id
       WHERE lp.product_id = $1`,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Loan product not found" },
      });
    }

    const row = result.rows[0] as any;
    return res.status(200).json({
      success: true,
      data: {
        ...row,
        minAmount: parseFloat(row.minAmount),
        maxAmount: parseFloat(row.maxAmount),
        interestRate: parseFloat(row.interestRate),
        eligibility: Array.isArray(row.eligibility) ? row.eligibility : [],
        tags: Array.isArray(row.tags) ? row.tags : [],
      },
    });
  } catch (error) {
    console.error("Failed to fetch loan product:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch loan product" },
    });
  }
});

export default router;
