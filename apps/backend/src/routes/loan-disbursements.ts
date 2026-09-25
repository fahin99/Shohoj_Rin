import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db.js";
import { requireAuth, type RequestWithAuth } from "../middleware/authenticate.js";

const router = Router();

const createDisbursementSchema = z.object({
  loanId: z.string().uuid(),
  amount: z.number().positive("Amount must be positive"),
  disbursementMethod: z.string().trim().min(1).max(50).optional(),
  referenceNumber: z.string().trim().max(100).optional(),
  paymentAccountId: z.string().uuid().optional(),
});

router.post("/", requireAuth, async (req: RequestWithAuth, res) => {
  const parsed = createDisbursementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid disbursement data", details: parsed.error.flatten() },
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const loanResult = await client.query(
      `SELECT user_id, application_id, principal_amount, status FROM loans WHERE loan_id = $1 FOR UPDATE`,
      [parsed.data.loanId],
    );

    if (loanResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: { message: "Loan not found" } });
    }

    const loan = loanResult.rows[0];

    if (req.auth!.role === "borrower") {
      await client.query("ROLLBACK");
      return res.status(403).json({ success: false, error: { message: "Access denied" } });
    }

    if (req.auth!.role !== "admin") {
      const funderCheck = await client.query(
        `SELECT 1 FROM funding_commitments
         WHERE application_id = $1 AND lender_user_id = $2 AND status = 'committed'`,
        [loan.application_id, req.auth!.userId],
      );
      if (funderCheck.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(403).json({ success: false, error: { message: "Access denied" } });
      }
    }
    const disbursedResult = await client.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_disbursed FROM loan_disbursements WHERE loan_id = $1`,
      [parsed.data.loanId],
    );
    const alreadyDisbursed = Number(disbursedResult.rows[0]?.total_disbursed || 0);
    const principalAmount = Number(loan.principal_amount);

    if (alreadyDisbursed + parsed.data.amount > principalAmount) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        error: { message: "Disbursement amount exceeds remaining loan principal" },
      });
    }

    let paymentAccountId: string | null = parsed.data.paymentAccountId ?? null;
    let method = parsed.data.disbursementMethod ?? null;

    if (paymentAccountId) {
      const accCheck = await client.query(
        `SELECT account_id, provider FROM user_payment_accounts WHERE account_id = $1 AND user_id = $2 AND is_active = TRUE`,
        [paymentAccountId, loan.user_id],
      );
      if (accCheck.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          error: { message: "Invalid or inactive disbursement payment account selected" },
        });
      }
      if (!method) {
        method = accCheck.rows[0].provider;
      }
    } else {
      const appAcc = await client.query(
        `SELECT la.disbursement_account_id, upa.provider
         FROM loans l
         JOIN loan_applications la ON la.application_id = l.application_id
         LEFT JOIN user_payment_accounts upa ON upa.account_id = la.disbursement_account_id AND upa.is_active = TRUE
         WHERE l.loan_id = $1`,
        [parsed.data.loanId],
      );
      if (appAcc.rows[0]?.disbursement_account_id) {
        paymentAccountId = appAcc.rows[0].disbursement_account_id;
        if (!method) {
          method = appAcc.rows[0].provider || "platform_transfer";
        }
      } else {
        const defaultAcc = await client.query(
          `SELECT account_id, provider FROM user_payment_accounts WHERE user_id = $1 AND is_default = TRUE AND is_active = TRUE LIMIT 1`,
          [loan.user_id],
        );
        if (defaultAcc.rows.length > 0) {
          paymentAccountId = defaultAcc.rows[0].account_id;
          if (!method) {
            method = defaultAcc.rows[0].provider;
          }
        }
      }
    }

    const disbResult = await client.query(
      `INSERT INTO loan_disbursements (loan_id, amount, disbursement_method, reference_number, disbursed_at, payment_account_id)
       VALUES ($1, $2, $3, $4, NOW(), $5)
       RETURNING disbursement_id AS "disbursementId", loan_id AS "loanId", amount, disbursement_method AS "disbursementMethod", reference_number AS "referenceNumber", disbursed_at AS "disbursedAt", payment_account_id AS "paymentAccountId"`,
      [
        parsed.data.loanId,
        parsed.data.amount,
        method,
        parsed.data.referenceNumber ?? null,
        paymentAccountId,
      ],
    );

    const totalDisbursedAfter = alreadyDisbursed + parsed.data.amount;
    const loanStatusAfterDisbursement =
      totalDisbursedAfter >= principalAmount ? "active" : "pending_disbursement";

    await client.query(`UPDATE loans SET status = $2, updated_at = NOW() WHERE loan_id = $1`, [
      parsed.data.loanId,
      loanStatusAfterDisbursement,
    ]);

    if (totalDisbursedAfter >= principalAmount) {
      await client.query(
        `UPDATE loan_applications la
         SET status = 'disbursed', updated_at = NOW()
         FROM loans l
         WHERE l.loan_id = $1 AND l.application_id = la.application_id`,
        [parsed.data.loanId],
      );
    }

    await client.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, after_state)
       VALUES ($1, 'disbursement_created', 'loan_disbursement', $2, jsonb_build_object('loanId', $3::uuid, 'amount', $4::numeric))`,
      [req.auth!.userId, disbResult.rows[0].disbursementId, parsed.data.loanId, parsed.data.amount],
    );

    await client.query("COMMIT");

    const disbursement = disbResult.rows[0] as any;
    return res.status(201).json({
      success: true,
      data: {
        ...disbursement,
        amount: parseFloat(disbursement.amount),
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Failed to create disbursement:", error);
    return res.status(500).json({
      success: false,
      error: { message: "Failed to create disbursement" },
    });
  } finally {
    client.release();
  }
});

export default router;
