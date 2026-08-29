import type { PoolClient } from "pg";
import { z } from "zod";
import { calculateLateFee } from "./interest.service.js";
import { recalculateAndPersistTrustScore } from "./trust-persistence.service.js";
const repaymentMethodSchema = z.enum(["bank_transfer", "mobile_money", "cash", "other"]);
export const createRepaymentSchema = z.object({
  scheduleId: z.string().uuid(),
  amountPaid: z.number().positive(),
  paymentMethod: repaymentMethodSchema.optional(),
  transactionReference: z.string().trim().min(1).max(100).optional(),
  providerReference: z.string().trim().min(1).max(100).optional(),
  status: z.enum(["completed", "failed", "reversed"]).optional(),
});
export type CreateRepaymentInput = z.infer<typeof createRepaymentSchema>;
export type RepaymentScheduleRow = {
  schedule_id: string;
  loan_id: string;
  installment_number: number;
  due_date: Date | string;
  expected_amount: string | number;
  status: string;
  created_at: Date | string;
};
export type RepaymentRow = {
  repayment_id: string;
  schedule_id: string;
  amount_paid: string | number;
  payment_method: string | null;
  transaction_reference: string | null;
  status: string;
  paid_at: Date | string;
};
export type RepaymentScheduleSummary = {
  scheduleId: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  expectedAmount: number;
  status: string;
  paidAmount: number;
  outstandingAmount: number;
  totalPaid: number;
  paymentsCount: number;
  daysLate: number;
  lateFee: number;
  latestPayment: {
    repaymentId: string;
    amountPaid: number;
    paymentMethod: string | null;
    transactionReference: string | null;
    status: string;
    paidAt: string;
  } | null;
};
export type RepaymentResult = {
  schedule: RepaymentScheduleSummary;
  repayment: {
    repaymentId: string;
    scheduleId: string;
    amountPaid: number;
    paymentMethod: string | null;
    transactionReference: string | null;
    status: string;
    paidAt: string;
  };
  loan: {
    loanId: string;
    status: string;
    totalOutstanding: number;
    nextDueDate: string | null;
  };
  trustScore: {
    score: number;
    band: string;
  } | null;
};
type LoanStatusRow = {
  loan_id: string;
  user_id: string;
  status: string;
};
type TrustScoreRow = {
  score_id: string;
  score: string | number;
  trust_band: string;
};
function toNumber(value: string | number | null | undefined) {
  return typeof value === "number" ? value : Number(value ?? 0);
}
function toIsoDate(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
function summarizeSchedule(
  schedule: RepaymentScheduleRow,
  repayments: RepaymentRow[],
  expectedAmount: number,
): RepaymentScheduleSummary {
  const completedRepayments = repayments.filter((p) => p.status === "completed");
  const totalPaid = completedRepayments.reduce(
    (sum, payment) => sum + toNumber(payment.amount_paid),
    0,
  );
  const latestPayment = repayments[repayments.length - 1] ?? null;
  const outstandingAmount = Math.max(0, Math.round((expectedAmount - totalPaid) * 100) / 100);
  const today = new Date();
  const dueDate = new Date(schedule.due_date);
  const daysLate =
    today > dueDate
      ? Math.max(0, Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;
  return {
    scheduleId: schedule.schedule_id,
    loanId: schedule.loan_id,
    installmentNumber: schedule.installment_number,
    dueDate: toIsoDate(schedule.due_date),
    expectedAmount,
    status: schedule.status,
    paidAmount: totalPaid,
    outstandingAmount,
    totalPaid,
    paymentsCount: repayments.length,
    daysLate,
    lateFee: calculateLateFee(outstandingAmount || expectedAmount, daysLate),
    latestPayment: latestPayment
      ? {
          repaymentId: latestPayment.repayment_id,
          amountPaid: toNumber(latestPayment.amount_paid),
          paymentMethod: latestPayment.payment_method,
          transactionReference: latestPayment.transaction_reference,
          status: latestPayment.status,
          paidAt: toIsoDate(latestPayment.paid_at),
        }
      : null,
  };
}
export async function getRepaymentSchedulesForLoan(
  client: Pick<PoolClient, "query">,
  loanId: string,
) {
  const schedules = await client.query<RepaymentScheduleRow>(
    `SELECT schedule_id, loan_id, installment_number, due_date, expected_amount, status, created_at
     FROM repayment_schedules
     WHERE loan_id = $1
     ORDER BY installment_number ASC`,
    [loanId],
  );
  if (!schedules.rowCount) {
    return [];
  }
  const repayments = await client.query<RepaymentRow>(
    `SELECT repayment_id, schedule_id, amount_paid, payment_method, transaction_reference, status, paid_at
     FROM repayments
     WHERE schedule_id = ANY($1::uuid[])
     ORDER BY paid_at ASC`,
    [schedules.rows.map((schedule) => schedule.schedule_id)],
  );
  const repaymentsBySchedule = new Map<string, RepaymentRow[]>();
  for (const repayment of repayments.rows) {
    const list = repaymentsBySchedule.get(repayment.schedule_id) ?? [];
    list.push(repayment);
    repaymentsBySchedule.set(repayment.schedule_id, list);
  }
  return schedules.rows.map((schedule) => {
    const scheduleRepayments = repaymentsBySchedule.get(schedule.schedule_id) ?? [];
    return summarizeSchedule(schedule, scheduleRepayments, toNumber(schedule.expected_amount));
  });
}
export async function recordRepayment(
  client: PoolClient,
  input: CreateRepaymentInput,
): Promise<RepaymentResult> {
  await client.query("BEGIN");
  try {
    const scheduleResult = await client.query<RepaymentScheduleRow>(
      `SELECT schedule_id, loan_id, installment_number, due_date, expected_amount, status, created_at
       FROM repayment_schedules
       WHERE schedule_id = $1
       FOR UPDATE`,
      [input.scheduleId],
    );
    if (!scheduleResult.rowCount) {
      await client.query("ROLLBACK");
      throw Object.assign(new Error("Repayment schedule not found"), {
        statusCode: 404,
        isOperational: true,
      });
    }
    const schedule = scheduleResult.rows[0];
    const repaymentAmount = Math.round(input.amountPaid * 100) / 100;
    const expectedAmount = toNumber(schedule.expected_amount);
    const repaymentResult = await client.query<RepaymentRow>(
      `INSERT INTO repayments (schedule_id, amount_paid, payment_method, transaction_reference, provider_reference, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (provider_reference) WHERE provider_reference IS NOT NULL DO NOTHING
       RETURNING repayment_id, schedule_id, amount_paid, payment_method, transaction_reference, status, paid_at`,
      [
        input.scheduleId,
        repaymentAmount,
        input.paymentMethod ?? null,
        input.transactionReference ?? null,
        input.providerReference ?? null,
        input.status ?? "completed",
      ],
    );

    if (repaymentResult.rowCount === 0 && input.providerReference) {
      // Idempotent duplicate: return the original result without re-processing side-effects.
      const existing = await client.query<RepaymentRow>(
        `SELECT repayment_id, schedule_id, amount_paid, payment_method, transaction_reference, status, paid_at
         FROM repayments WHERE provider_reference = $1`,
        [input.providerReference],
      );
      if (existing.rowCount && existing.rowCount > 0) {
        await client.query("ROLLBACK");
        const existingRepay = existing.rows[0];
        const allSched = await getRepaymentSchedulesForLoan(client, schedule.loan_id);
        const schedSummary = allSched.find((s) => s.scheduleId === existingRepay.schedule_id)!;
        const loanInfoResult = await client.query<LoanStatusRow>(
          `SELECT loan_id, user_id, status FROM loans WHERE loan_id = $1`,
          [schedule.loan_id],
        );
        const totalExpected = allSched.reduce((sum, row) => sum + row.expectedAmount, 0);
        const totalPaidAll = allSched.reduce((sum, row) => sum + row.totalPaid, 0);
        const loanTotalOutstanding = Math.max(
          0,
          Math.round((totalExpected - totalPaidAll) * 100) / 100,
        );
        const nextDue = allSched.find((s) => s.status !== "paid");
        return {
          schedule: schedSummary,
          repayment: {
            repaymentId: existingRepay.repayment_id,
            scheduleId: existingRepay.schedule_id,
            amountPaid: toNumber(existingRepay.amount_paid),
            paymentMethod: existingRepay.payment_method,
            transactionReference: existingRepay.transaction_reference,
            status: existingRepay.status,
            paidAt: toIsoDate(existingRepay.paid_at),
          },
          loan: {
            loanId: schedSummary.loanId,
            status: loanInfoResult.rows[0]?.status ?? "active",
            totalOutstanding: loanTotalOutstanding,
            nextDueDate: nextDue ? nextDue.dueDate : null,
          },
          trustScore: null,
        };
      }
    }
    const allRepayments = await client.query<RepaymentRow>(
      `SELECT repayment_id, schedule_id, amount_paid, payment_method, transaction_reference, status, paid_at
       FROM repayments
       WHERE schedule_id = $1
       ORDER BY paid_at ASC`,
      [input.scheduleId],
    );
    const completedRepayments = allRepayments.rows.filter((p) => p.status === "completed");
    const totalPaid = completedRepayments.reduce(
      (sum, repayment) => sum + toNumber(repayment.amount_paid),
      0,
    );
    const outstandingAmount = Math.max(0, Math.round((expectedAmount - totalPaid) * 100) / 100);
    const today = new Date();
    const dueDate = new Date(schedule.due_date);
    const daysLate =
      today > dueDate
        ? Math.max(0, Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;
    const nextStatus =
      outstandingAmount <= 0 ? "paid" : totalPaid > 0 ? "partially_paid" : schedule.status;
    await client.query(
      `UPDATE repayment_schedules
       SET status = $2
       WHERE schedule_id = $1`,
      [input.scheduleId, nextStatus],
    );
    const loanResult = await client.query<LoanStatusRow>(
      `SELECT loan_id, user_id, status
       FROM loans
       WHERE loan_id = $1
       FOR UPDATE`,
      [schedule.loan_id],
    );
    if (!loanResult.rowCount) {
      throw Object.assign(new Error("Loan not found"), { statusCode: 404, isOperational: true });
    }
    const loanRow = loanResult.rows[0];
    const allSchedules = await client.query<{
      schedule_id: string;
      status: string;
      due_date: Date | string;
      expected_amount: string | number;
    }>(
      `SELECT schedule_id, status, due_date, expected_amount
       FROM repayment_schedules
       WHERE loan_id = $1
       ORDER BY installment_number ASC`,
      [schedule.loan_id],
    );
    const nextDueSchedule = allSchedules.rows.find((row) => row.status !== "paid") ?? null;
    const loanStatus = nextDueSchedule
      ? nextDueSchedule.status === "overdue"
        ? "overdue"
        : loanRow.status
      : "closed";
    await client.query(
      `UPDATE loans
       SET status = $2,
           updated_at = NOW()
       WHERE loan_id = $1`,
      [schedule.loan_id, loanStatus],
    );
    const trustScore = await recalculateAndPersistTrustScore(
      loanRow.user_id,
      "repayment_received",
      client,
    );
    await client.query("COMMIT");
    return {
      schedule: {
        ...summarizeSchedule(schedule, allRepayments.rows, expectedAmount),
        outstandingAmount,
      },
      repayment: {
        repaymentId: repaymentResult.rows[0].repayment_id,
        scheduleId: repaymentResult.rows[0].schedule_id,
        amountPaid: toNumber(repaymentResult.rows[0].amount_paid),
        paymentMethod: repaymentResult.rows[0].payment_method,
        transactionReference: repaymentResult.rows[0].transaction_reference,
        status: repaymentResult.rows[0].status,
        paidAt: toIsoDate(repaymentResult.rows[0].paid_at),
      },
      loan: {
        loanId: schedule.loan_id,
        status: loanStatus,
        totalOutstanding: Math.max(
          0,
          Math.round(
            (allSchedules.rows.reduce((sum, row) => sum + toNumber(row.expected_amount), 0) -
              totalPaid) *
              100,
          ) / 100,
        ),
        nextDueDate: nextDueSchedule ? toIsoDate(nextDueSchedule.due_date) : null,
      },
      trustScore,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
