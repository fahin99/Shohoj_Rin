import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { calculateReducingBalanceSchedule } from "../services/interest.service.js";

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

    if (role === "borrower" && app.user_id !== userId) {
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
      return res.status(400).json({ success: false, error: { message: "Application is not eligible for loan creation" } });
    }

    const existingLoan = await client.query(
      `SELECT loan_id FROM loans WHERE application_id = $1`,
      [parsed.data.applicationId],
    );
    if (Number(existingLoan.rowCount) > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, error: { message: "Loan already created for this application" } });
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

    const partnerId = app.partner_id ?? (await getFunderPartnerId(client, parsed.data.applicationId));
    if (!partnerId) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error: { message: "Unable to determine a funding partner for this application" },
      });
    }

    const interestRate = typeof app.interest_rate === "number" ? app.interest_rate : Number(app.interest_rate ?? 12.0);
    const tenureMonths = typeof app.duration_months === "number" ? app.duration_months : Number(app.duration_months ?? 12);
    const principal = typeof app.requested_amount === "number" ? app.requested_amount : Number(app.requested_amount);

    const offerResult = await client.query(
      `INSERT INTO loan_offers
        (application_id, partner_id, offered_amount, interest_rate, tenure_months, conditions, status, offered_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'accepted', NOW())
       RETURNING offer_id`,
      [
        parsed.data.applicationId,
        partnerId,
        principal,
        interestRate,
        tenureMonths,
        "Standard terms",
      ],
    );
    const offerId = offerResult.rows[0].offer_id;

    const startDate = new Date();
    const expectedEndDate = new Date(startDate);
    expectedEndDate.setMonth(expectedEndDate.getMonth() + tenureMonths);

    const loanResult = await client.query(
      `INSERT INTO loans
        (application_id, offer_id, user_id, partner_id, principal_amount, interest_rate, tenure_months, status, start_date, expected_end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending_disbursement', $8, $9)
       RETURNING
         loan_id AS "loanId",
         application_id AS "applicationId",
         user_id AS "userId",
         partner_id AS "partnerId",
         principal_amount AS "principalAmount",
         interest_rate AS "interestRate",
         tenure_months AS "tenureMonths",
         status,
         start_date AS "startDate",
         expected_end_date AS "expectedEndDate",
         created_at AS "createdAt"`,
      [
        parsed.data.applicationId,
        offerId,
        app.user_id,
        partnerId,
        principal,
        interestRate,
        tenureMonths,
        startDate.toISOString().split("T")[0],
        expectedEndDate.toISOString().split("T")[0],
      ],
    );
    await client.query(
      `UPDATE loan_applications SET status = 'approved', updated_at = NOW() WHERE application_id = $1`,
      [parsed.data.applicationId],
    );

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, after_state)
       VALUES ($1, 'loan_created', 'loan', $2, jsonb_build_object('applicationId', $3::uuid, 'principalAmount', $4::numeric, 'tenureMonths', $5::integer))`,
      [userId, loanResult.rows[0].loanId, parsed.data.applicationId, principal, tenureMonths],
    );

    await client.query("COMMIT");

    const loan = loanResult.rows[0] as any;
    return res.status(201).json({
      success: true,
      data: {
        ...loan,
        principalAmount: parseFloat(loan.principalAmount),
        interestRate: parseFloat(loan.interestRate),
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
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

async function getFunderPartnerId(
  client: Pick<any, "query">,
  applicationId: string,
): Promise<string | null> {
  const result = await client.query(
    `SELECT u.partner_id
     FROM funding_commitments fc
     JOIN users u ON u.user_id = fc.lender_user_id
     WHERE fc.application_id = $1 AND fc.status = 'committed' AND u.partner_id IS NOT NULL
     ORDER BY fc.created_at ASC
     LIMIT 1`,
    [applicationId],
  );
  return result.rowCount > 0 ? result.rows[0].partner_id : null;
}

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