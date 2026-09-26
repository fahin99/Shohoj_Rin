import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import {
  finalizeFullyFundedLoan,
  LoanFinalizationConfigError,
} from "../services/loan-lifecycle.service.js";

const router = Router();

// POST /api/v1/loans — create loan from application
router.post("/", requireAuth, async (req, res) => {
  const authReq = req as RequestWithAuth;
  const userId = authReq.auth!.userId;
  const role = authReq.auth!.role;

  const parsed = z.object({ applicationId: z.string().uuid() }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid request", details: parsed.error.flatten() },
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const appResult = await client.query(
      `SELECT
        la.application_id,
        la.user_id,
        la.partner_id,
        la.product_id,
        la.requested_amount,
        la.duration_months AS application_duration_months,
        la.status AS application_status,
        lp.interest_rate,
        lp.duration_months
       FROM loan_applications la
       LEFT JOIN loan_products lp ON lp.product_id = la.product_id
       WHERE la.application_id = $1`,
      [parsed.data.applicationId],
    );

    if (appResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: { message: "Application not found" } });
    }

    const app = appResult.rows[0] as any;

    if (role === "borrower") {
      await client.query("ROLLBACK");
      return res.status(403).json({ success: false, error: { message: "Access denied" } });
    }
    if (role === "lender") {
      const funderCheck = await client.query(
        `SELECT 1 FROM funding_commitments
         WHERE application_id = $1 AND lender_user_id = $2 AND status = 'committed'`,
        [parsed.data.applicationId, userId],
      );
      if (Number(funderCheck.rowCount) === 0) {
        await client.query("ROLLBACK");
        return res.status(403).json({
          success: false,
          error: { message: "You have not committed funding to this application" },
        });
      }
    }

    if (!["submitted", "under_review", "approved"].includes(app.application_status)) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({
          success: false,
          error: { message: "Application is not eligible for loan creation" },
        });
    }

    const existingLoan = await client.query(`SELECT loan_id FROM loans WHERE application_id = $1`, [
      parsed.data.applicationId,
    ]);
    if (Number(existingLoan.rowCount) > 0) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ success: false, error: { message: "Loan already created for this application" } });
    }
    const fundingResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS committed_amount
       FROM funding_commitments
       WHERE application_id = $1 AND status = 'committed'`,
      [parsed.data.applicationId],
    );
    const committedAmount = Number(fundingResult.rows[0].committed_amount);
    const requestedAmount = Number(app.requested_amount);
    if (committedAmount < requestedAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error: {
          message: `Application is not fully funded (${committedAmount} committed of ${requestedAmount} requested)`,
        },
      });
    }

    const finalized = await finalizeFullyFundedLoan(client, {
      applicationId: parsed.data.applicationId,
      funderUserId: userId,
    });

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      data: {
        loanId: finalized.loanId,
        applicationId: finalized.applicationId,
        userId: finalized.userId,
        partnerId: finalized.partnerId,
        principalAmount: finalized.principalAmount,
        interestRate: finalized.interestRate,
        tenureMonths: finalized.tenureMonths,
        status: finalized.status,
        startDate: finalized.startDate,
        expectedEndDate: finalized.expectedEndDate,
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
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to create loan:", message);
    return res.status(500).json({
      success: false,
      error: { message: `Failed to create loan: ${message}` },
    });
  } finally {
    client.release();
  }
});

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
      whereClause = `WHERE EXISTS (
        SELECT 1 FROM funding_commitments fc
        WHERE fc.application_id = l.application_id
          AND fc.lender_user_id = $${paramIdx}
          AND fc.status = 'committed'
      )`;
      params.push(userId);
      paramIdx++;
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
        lp.name AS "productName",
        (SELECT COUNT(*)::int FROM repayment_schedules rs WHERE rs.loan_id = l.loan_id) AS "totalInstallments",
        (SELECT COUNT(*)::int
         FROM repayment_schedules rs
         WHERE rs.loan_id = l.loan_id
           AND EXISTS (
             SELECT 1 FROM repayments r
             WHERE r.schedule_id = rs.schedule_id AND r.status = 'completed'
           )) AS "paidInstallments",
        COALESCE((SELECT SUM(rs.expected_amount) FROM repayment_schedules rs WHERE rs.loan_id = l.loan_id), 0) AS "totalExpected",
        COALESCE((SELECT SUM(r.amount_paid) FROM repayments r JOIN repayment_schedules rs ON rs.schedule_id = r.schedule_id WHERE rs.loan_id = l.loan_id AND r.status = 'completed'), 0) AS "totalPaid"
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
      totalInstallments: Number(row.totalInstallments),
      paidInstallments: Number(row.paidInstallments),
      totalExpected: parseFloat(row.totalExpected),
      totalPaid: parseFloat(row.totalPaid),
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

    if (role === "lender") {
      const fundingCheck = await pool.query(
        `SELECT 1 FROM funding_commitments
         WHERE application_id = $1 AND lender_user_id = $2 AND status = 'committed'`,
        [loan.applicationId, userId],
      );
      if (fundingCheck.rowCount === 0) {
        return res.status(403).json({
          success: false,
          error: { message: "Access denied" },
        });
      }
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
        COUNT(*) FILTER (
          WHERE EXISTS (
            SELECT 1 FROM repayments r
            WHERE r.schedule_id = repayment_schedules.schedule_id AND r.status = 'completed'
          )
        ) AS "paidInstallments",
        COALESCE(SUM(expected_amount), 0) AS "totalExpected",
        COALESCE((
          SELECT SUM(r.amount_paid)
          FROM repayments r
          JOIN repayment_schedules paid_schedule ON paid_schedule.schedule_id = r.schedule_id
          WHERE paid_schedule.loan_id = $1 AND r.status = 'completed'
        ), 0) AS "totalPaid"
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
      `SELECT user_id, application_id FROM loans WHERE loan_id = $1`,
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
    if (role === "lender") {
      const fundingCheck = await pool.query(
        `SELECT 1 FROM funding_commitments
         WHERE application_id = $1 AND lender_user_id = $2 AND status = 'committed'`,
        [loanResult.rows[0].application_id, userId],
      );
      if (fundingCheck.rowCount === 0) {
        return res.status(403).json({
          success: false,
          error: { message: "Access denied" },
        });
      }
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
