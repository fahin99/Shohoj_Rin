import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";
import {
  createRepaymentSchema,
  getRepaymentSchedulesForLoan,
  recordRepayment,
} from "../services/repayment.service.js";
const router = Router();
const loanIdParamsSchema = z.object({
  loanId: z.string().uuid(),
});
router.use(requireAuth);
router.get("/loans/:loanId/schedules", async (req: RequestWithAuth, res) => {
  const parsed = loanIdParamsSchema.safeParse(req.params);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid loan id", details: parsed.error.flatten() },
    });
  }
  const client = await pool.connect();
  try {
    const loanCheck = await client.query(
      "SELECT user_id, application_id FROM loans WHERE loan_id = $1",
      [parsed.data.loanId],
    );
    if (loanCheck.rowCount === 0) {
      return res.status(404).json({ success: false, error: { message: "Loan not found" } });
    }
    const loan = loanCheck.rows[0];
    if (loan.user_id !== req.auth!.userId && req.auth!.role !== "admin") {
      const funderCheck = await client.query(
        `SELECT 1 FROM funding_commitments
         WHERE application_id = $1 AND lender_user_id = $2 AND status = 'committed'`,
        [loan.application_id, req.auth!.userId],
      );
      if (funderCheck.rowCount === 0) {
        return res.status(403).json({ success: false, error: { message: "Forbidden" } });
      }
    }

    const schedules = await getRepaymentSchedulesForLoan(client, parsed.data.loanId);
    return res.status(200).json({
      success: true,
      data: {
        loanId: parsed.data.loanId,
        schedules,
      },
    });
  } catch (error) {
    if (typeof error === "object" && error && "statusCode" in error) {
      const statusCode = Number((error as { statusCode?: number }).statusCode) || 500;
      return res.status(statusCode).json({
        success: false,
        error: { message: (error as unknown as Error).message },
      });
    }
    console.error("Failed to load repayment schedules:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to load repayment schedules" },
    });
  } finally {
    client.release();
  }
});
router.post("/payments", async (req: RequestWithAuth, res) => {
  const parsed = createRepaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid repayment data", details: parsed.error.flatten() },
    });
  }
  const client = await pool.connect();
  try {
    const schedCheck = await client.query(
      "SELECT loans.user_id FROM repayment_schedules JOIN loans ON repayment_schedules.loan_id = loans.loan_id WHERE repayment_schedules.schedule_id = $1",
      [parsed.data.scheduleId],
    );
    if (schedCheck.rowCount === 0) {
      return res.status(404).json({ success: false, error: { message: "Schedule not found" } });
    }
    const borrowerUserId = schedCheck.rows[0].user_id;
    if (borrowerUserId !== req.auth!.userId && req.auth!.role !== "admin") {
      return res.status(403).json({ success: false, error: { message: "Forbidden" } });
    }

    let paymentAccountId = parsed.data.paymentAccountId ?? null;
    let paymentMethod = parsed.data.paymentMethod;

    if (paymentAccountId) {
      const accRes = await client.query(
        `SELECT account_id, account_type, provider FROM user_payment_accounts WHERE account_id = $1 AND user_id = $2 AND is_active = TRUE`,
        [paymentAccountId, borrowerUserId],
      );
      if (accRes.rowCount === 0) {
        return res.status(400).json({
          success: false,
          error: { message: "Invalid or inactive payment account selected" },
        });
      }
      if (!paymentMethod) {
        paymentMethod = accRes.rows[0].account_type === "bank" ? "bank_transfer" : "mobile_money";
      }
    } else {
      const defaultAcc = await client.query(
        `SELECT account_id, account_type, provider FROM user_payment_accounts WHERE user_id = $1 AND is_default = TRUE AND is_active = TRUE LIMIT 1`,
        [borrowerUserId],
      );
      if (defaultAcc.rows.length > 0) {
        paymentAccountId = defaultAcc.rows[0].account_id;
        if (!paymentMethod) {
          paymentMethod = defaultAcc.rows[0].account_type === "bank" ? "bank_transfer" : "mobile_money";
        }
      }
    }

    const result = await recordRepayment(client, {
      ...parsed.data,
      paymentAccountId: paymentAccountId ?? undefined,
      paymentMethod: paymentMethod ?? parsed.data.paymentMethod,
    });
    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (typeof error === "object" && error && "statusCode" in error) {
      const statusCode = Number((error as { statusCode?: number }).statusCode) || 500;
      return res.status(statusCode).json({
        success: false,
        error: { message: (error as unknown as Error).message },
      });
    }
    console.error("Failed to record repayment:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to record repayment" },
    });
  } finally {
    client.release();
  }
});
export default router;
