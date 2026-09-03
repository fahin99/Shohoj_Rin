import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import { calculateReducingBalanceSchedule } from "../services/interest.service.js";

const router = Router();

const generateScheduleSchema = z.object({
  loanId: z.string().uuid(),
});

// POST /api/v1/repayment-schedules — generate repayment schedules for a loan
router.post("/", requireAuth, async (req: RequestWithAuth, res) => {
  const parsed = generateScheduleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid request", details: parsed.error.flatten() },
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const loanResult = await client.query(
      `SELECT l.loan_id, l.user_id, l.application_id, l.principal_amount, l.interest_rate, l.tenure_months, l.start_date, l.status
       FROM loans l
       WHERE l.loan_id = $1
       FOR UPDATE`,
      [parsed.data.loanId],
    );

    if (loanResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: { message: "Loan not found" } });
    }

    const loan = loanResult.rows[0] as any;
    const isBorrower = loan.user_id === req.user!.userId;
    const isAdmin = req.user!.role === "admin";

    if (!isBorrower && !isAdmin) {
      const fundingCheck = await client.query(
        `SELECT 1
         FROM loan_applications la
         JOIN funding_commitments fc ON fc.application_id = la.application_id
         WHERE la.application_id = $1 AND fc.lender_user_id = $2 AND fc.status = 'committed'`,
        [loan.application_id, req.user!.userId],
      );
      if (fundingCheck.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(403).json({ success: false, error: { message: "Access denied" } });
      }
    }

    const existing = await client.query(
      `SELECT COUNT(*) AS total FROM repayment_schedules WHERE loan_id = $1`,
      [parsed.data.loanId],
    );
    if (Number(existing.rows[0].total) > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ success: false, error: { message: "Repayment schedules already generated for this loan" } });
    }

    const schedule = calculateReducingBalanceSchedule(
      Number(loan.principal_amount),
      Number(loan.interest_rate),
      Number(loan.tenure_months),
      new Date(loan.start_date),
    );

    const inserted: any[] = [];
    for (const item of schedule) {
      const row = await client.query(
        `INSERT INTO repayment_schedules (loan_id, installment_number, due_date, expected_amount, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING schedule_id AS "scheduleId", loan_id AS "loanId", installment_number AS "installmentNumber", due_date AS "dueDate", expected_amount AS "expectedAmount", status`,
        [parsed.data.loanId, item.installmentNumber, item.dueDate.toISOString().split("T")[0], Number(item.totalInstallment)],
      );
      inserted.push({ ...row.rows[0], expectedAmount: parseFloat(row.rows[0].expectedAmount) });
    }

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, after_state)
       VALUES ($1, 'repayment_schedules_generated', 'repayment_schedule', $2, jsonb_build_object('loanId', $3::uuid, 'installments', $4::integer))`,
      [req.user!.userId, parsed.data.loanId, parsed.data.loanId, inserted.length],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      data: { loanId: parsed.data.loanId, schedules: inserted },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to generate repayment schedules:", message);
    return res.status(500).json({
      success: false,
      error: { message: `Failed to generate repayment schedules: ${message}` },
    });
  } finally {
    client.release();
  }
});

export default router;
