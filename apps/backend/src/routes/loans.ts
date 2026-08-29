import { Router } from "express";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";

const router = Router();

// GET /api/v1/loans — list user's loans
router.get("/", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;
  const role = authReq.auth!.role;

  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10));
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || "20"), 10)));
    const offset = (page - 1) * limit;

    let whereClause: string;
    const params: (string | number)[] = [];
    let paramIdx = 1;

    if (role === "lender") {
      // Lender sees loans they funded (partner association)
      // For now, lender sees loans where they have funded via investor commitments
      // Fallback: lender sees all loans from partners they're associated with
      whereClause = `WHERE 1=1`;
    } else if (role === "admin") {
      whereClause = `WHERE 1=1`;
    } else {
      // Borrower sees own loans
      whereClause = `WHERE l.user_id = $${paramIdx++}`;
      params.push(userId);
    }

    const status = typeof req.query.status === "string" ? req.query.status : null;
    if (status && status !== "all") {
      whereClause += ` AND l.status = $${paramIdx++}`;
      params.push(status);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM loans l ${whereClause}`,
      params,
    );
    const total = parseInt(countResult.rows[0].total, 10);

    const dataParams = [...params, limit, offset];
    const result = await pool.query(
      `SELECT
        l.loan_id AS "loanId",
        l.application_id AS "applicationId",
        l.user_id AS "userId",
        l.partner_id AS "partnerId",
        l.principal_amount AS "principalAmount",
        l.interest_rate AS "interestRate",
        l.tenure_months AS "tenureMonths",
        l.status,
        l.start_date AS "startDate",
        l.expected_end_date AS "expectedEndDate",
        l.created_at AS "createdAt",
        fp.name AS "partnerName",
        up.full_name AS "borrowerName",
        la.purpose,
        lp.name AS "productName"
       FROM loans l
       JOIN funding_partners fp ON fp.partner_id = l.partner_id
       LEFT JOIN user_profiles up ON up.user_id = l.user_id
       LEFT JOIN loan_applications la ON la.application_id = l.application_id
       LEFT JOIN loan_products lp ON lp.product_id = la.product_id
       ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      dataParams,
    );

    const loans = result.rows.map((row: any) => ({
      ...row,
      principalAmount: parseFloat(row.principalAmount),
      interestRate: parseFloat(row.interestRate),
    }));

    return res.status(200).json({
      success: true,
      data: { loans, total },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch loans:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch loans" },
    });
  }
});

// GET /api/v1/loans/:id — get loan detail
router.get("/:id", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;
  const role = authReq.auth!.role;

  try {
    const result = await pool.query(
      `SELECT
        l.loan_id AS "loanId",
        l.application_id AS "applicationId",
        l.user_id AS "userId",
        l.partner_id AS "partnerId",
        l.principal_amount AS "principalAmount",
        l.interest_rate AS "interestRate",
        l.tenure_months AS "tenureMonths",
        l.status,
        l.start_date AS "startDate",
        l.expected_end_date AS "expectedEndDate",
        l.created_at AS "createdAt",
        l.updated_at AS "updatedAt",
        fp.name AS "partnerName",
        up.full_name AS "borrowerName",
        la.purpose,
        la.purpose_description AS "purposeDescription",
        lp.name AS "productName"
       FROM loans l
       JOIN funding_partners fp ON fp.partner_id = l.partner_id
       LEFT JOIN user_profiles up ON up.user_id = l.user_id
       LEFT JOIN loan_applications la ON la.application_id = l.application_id
       LEFT JOIN loan_products lp ON lp.product_id = la.product_id
       WHERE l.loan_id = $1`,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Loan not found" },
      });
    }

    const loan = result.rows[0] as any;

    // Ownership check for borrowers
    if (role === "borrower" && loan.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: "Access denied" },
      });
    }

    // Get disbursement info
    const disbursements = await pool.query(
      `SELECT
        disbursement_id AS "disbursementId",
        amount,
        disbursement_method AS "disbursementMethod",
        reference_number AS "referenceNumber",
        disbursed_at AS "disbursedAt"
       FROM loan_disbursements
       WHERE loan_id = $1
       ORDER BY disbursed_at`,
      [req.params.id],
    );

    // Get repayment summary
    const scheduleResult = await pool.query(
      `SELECT
        COUNT(*) AS "totalInstallments",
        COUNT(*) FILTER (WHERE status = 'paid') AS "paidInstallments",
        COALESCE(SUM(expected_amount), 0) AS "totalExpected",
        COALESCE(SUM(expected_amount) FILTER (WHERE status = 'paid'), 0) AS "totalPaid"
       FROM repayment_schedules
       WHERE loan_id = $1`,
      [req.params.id],
    );

    return res.status(200).json({
      success: true,
      data: {
        ...loan,
        principalAmount: parseFloat(loan.principalAmount),
        interestRate: parseFloat(loan.interestRate),
        disbursements: disbursements.rows.map((d: any) => ({
          ...d,
          amount: parseFloat(d.amount),
        })),
        repaymentSummary: {
          totalInstallments: parseInt(scheduleResult.rows[0].totalInstallments, 10),
          paidInstallments: parseInt(scheduleResult.rows[0].paidInstallments, 10),
          totalExpected: parseFloat(scheduleResult.rows[0].totalExpected),
          totalPaid: parseFloat(scheduleResult.rows[0].totalPaid),
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch loan:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch loan" },
    });
  }
});

// GET /api/v1/loans/:id/transactions — loan transaction history
router.get("/:id/transactions", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;
  const role = authReq.auth!.role;

  try {
    // Verify ownership
    const loanResult = await pool.query(
      `SELECT user_id FROM loans WHERE loan_id = $1`,
      [req.params.id],
    );
    if (loanResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: { message: "Loan not found" },
      });
    }
    if (role === "borrower" && loanResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: "Access denied" },
      });
    }

    // Get repayments as transactions
    const result = await pool.query(
      `SELECT
        r.repayment_id AS "id",
        r.paid_at AS "date",
        CONCAT('Installment #', rs.installment_number, ' payment') AS "description",
        r.amount_paid AS "amount",
        'repayment' AS "type",
        r.status
       FROM repayments r
       JOIN repayment_schedules rs ON rs.schedule_id = r.schedule_id
       WHERE rs.loan_id = $1
       ORDER BY r.paid_at DESC`,
      [req.params.id],
    );

    // Get disbursements as transactions
    const disbResult = await pool.query(
      `SELECT
        disbursement_id AS "id",
        disbursed_at AS "date",
        'Loan disbursement' AS "description",
        amount,
        'disbursement' AS "type",
        'completed' AS "status"
       FROM loan_disbursements
       WHERE loan_id = $1
       ORDER BY disbursed_at DESC`,
      [req.params.id],
    );

    const transactions = [
      ...result.rows.map((r: any) => ({ ...r, amount: parseFloat(r.amount) })),
      ...disbResult.rows.map((d: any) => ({ ...d, amount: parseFloat(d.amount) })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to fetch transactions" },
    });
  }
});

export default router;
