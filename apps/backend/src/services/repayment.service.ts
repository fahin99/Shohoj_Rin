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
) : RepaymentScheduleSummary {
  const completedRepayments = repayments.filter(p => p.status === 'completed');
  const totalPaid = completedRepayments.reduce((sum, payment) => sum + toNumber(payment.amount_paid), 0);
  const latestPayment = repayments[repayments.length - 1] ?? null;
  const outstandingAmount = Math.max(0, Math.round((expectedAmount - totalPaid) * 100) / 100);
  const today = new Date();
  const dueDate = new Date(schedule.due_date);
  const daysLate = today > dueDate ? Math.max(0, Math.ceil((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))) : 0;
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
export async function getRepaymentSchedulesForLoan(client: Pick<PoolClient, "query">, loanId: string) {
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
export async function recordRepayment(client: PoolClient, input: CreateRepaymentInput): Promise<RepaymentResult> {
  await client.query("BEGIN");
  try {
    // Single procedure call replaces 7 round-trips
    const procResult = await client.query<{
      out_repayment_id: string;
      out_schedule_status: string;
      out_loan_id: string;
      out_loan_status: string;
      out_user_id: string;
      out_total_outstanding: string | number;
      out_is_duplicate: boolean;
    }>(
      `CALL process_repayment($1, $2, $3, $4, $5, $6, NULL, NULL, NULL, NULL, NULL, NULL, NULL)`,
      [
        input.scheduleId,
        Math.round(input.amountPaid * 100) / 100,
        input.paymentMethod ?? null,
        input.transactionReference ?? null,
        input.providerReference ?? null,
        input.status ?? "completed",
      ],
    );

    const proc = procResult.rows[0];

    if (!proc.out_repayment_id) {
      await client.query("ROLLBACK");
      throw Object.assign(new Error("Repayment schedule not found"), { statusCode: 404, isOperational: true });
    }

    // Fetch the repayment row for response details
    const repaymentRow = await client.query<RepaymentRow>(
      `SELECT repayment_id, schedule_id, amount_paid, payment_method, transaction_reference, status, paid_at
       FROM repayments WHERE repayment_id = $1`,
      [proc.out_repayment_id],
    );
    const repayment = repaymentRow.rows[0];

    // For duplicate hits, skip trust score recalculation
    if (proc.out_is_duplicate) {
      await client.query("ROLLBACK");

      // Fetch schedule summary for the response
      const allSched = await getRepaymentSchedulesForLoan(client, proc.out_loan_id);
      const schedSummary = allSched.find(s => s.scheduleId === repayment.schedule_id)!;
      const nextDue = allSched.find(s => s.status !== "paid");

      return {
        schedule: schedSummary,
        repayment: {
          repaymentId: repayment.repayment_id,
          scheduleId: repayment.schedule_id,
          amountPaid: toNumber(repayment.amount_paid),
          paymentMethod: repayment.payment_method,
          transactionReference: repayment.transaction_reference,
          status: repayment.status,
          paidAt: toIsoDate(repayment.paid_at),
        },
        loan: {
          loanId: proc.out_loan_id,
          status: proc.out_loan_status,
          totalOutstanding: toNumber(proc.out_total_outstanding),
          nextDueDate: nextDue ? nextDue.dueDate : null,
        },
        trustScore: null,
      };
    }

    // Recalculate trust score (still app-side — complex calculation logic)
    const trustScore = await recalculateAndPersistTrustScore(
      proc.out_user_id,
      "repayment_received",
      client
    );

    await client.query("COMMIT");

    // Fetch schedule details for the response
    const scheduleRow = await client.query<RepaymentScheduleRow>(
      `SELECT schedule_id, loan_id, installment_number, due_date, expected_amount, status, created_at
       FROM repayment_schedules WHERE schedule_id = $1`,
      [input.scheduleId],
    );
    const schedule = scheduleRow.rows[0];
    const allRepayments = await client.query<RepaymentRow>(
      `SELECT repayment_id, schedule_id, amount_paid, payment_method, transaction_reference, status, paid_at
       FROM repayments WHERE schedule_id = $1 ORDER BY paid_at ASC`,
      [input.scheduleId],
    );

    // Find next due schedule for the response
    const allSchedules = await client.query<{ status: string; due_date: Date | string }>(
      `SELECT status, due_date FROM repayment_schedules WHERE loan_id = $1 ORDER BY installment_number ASC`,
      [proc.out_loan_id],
    );
    const nextDueSchedule = allSchedules.rows.find((row) => row.status !== "paid") ?? null;

    return {
      schedule: summarizeSchedule(schedule, allRepayments.rows, toNumber(schedule.expected_amount)),
      repayment: {
        repaymentId: repayment.repayment_id,
        scheduleId: repayment.schedule_id,
        amountPaid: toNumber(repayment.amount_paid),
        paymentMethod: repayment.payment_method,
        transactionReference: repayment.transaction_reference,
        status: repayment.status,
        paidAt: toIsoDate(repayment.paid_at),
      },
      loan: {
        loanId: proc.out_loan_id,
        status: proc.out_loan_status,
        totalOutstanding: toNumber(proc.out_total_outstanding),
        nextDueDate: nextDueSchedule ? toIsoDate(nextDueSchedule.due_date) : null,
      },
      trustScore,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

