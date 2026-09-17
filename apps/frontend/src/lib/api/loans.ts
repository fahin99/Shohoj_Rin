import { apiRequest } from "../api";
import type { LoanProduct } from "@shohojrin/shared";
import type { ActiveLoan, LoanStatus, RepaymentScheduleRow, Transaction } from "../../types";

interface RawLoanData {
  principalAmount?: number | string;
  interestRate?: number | string;
  tenureMonths?: number | string;
  loanId?: string;
  status?: string;
  productName?: string;
  purpose?: string;
  partnerName?: string;
  expectedEndDate?: string;
  totalInstallments?: number;
  paidInstallments?: number;
  totalExpected?: number;
  totalPaid?: number;
}

interface RepaymentScheduleEntry {
  scheduleId: string;
  installmentNumber: number;
  dueDate: string;
  expectedAmount: number;
  status: string;
  outstandingAmount: number;
}

interface RepaymentResult {
  receiptId?: string;
  loan?: { status: string };
}

export async function getLoanProducts(params?: {
  category?: string;
  search?: string;
  page?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== "all") searchParams.set("category", params.category);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  const qs = searchParams.toString();
  return apiRequest<{ products: LoanProduct[]; total: number }>(
    `/loan-products${qs ? `?${qs}` : ""}`,
  );
}

export async function getLoanProduct(id: string) {
  return apiRequest<LoanProduct>(`/loan-products/${id}`);
}

export async function getLoansCountByStatus(status?: string) {
  const searchParams = new URLSearchParams();
  if (status) searchParams.set("status", status);
  searchParams.set("limit", "1");
  const qs = searchParams.toString();
  const data = await apiRequest<{ loans: unknown[]; total: number }>(`/loans?${qs}`);
  return data.total;
}

export async function getActiveLoans(includePendingDisbursement = false): Promise<ActiveLoan[]> {
  const statusQuery = includePendingDisbursement ? "" : "?status=active";
  const data = await apiRequest<{ loans: RawLoanData[] }>(`/loans${statusQuery}`);
  return data.loans.map((loan) => {
    const principal = Number(loan.principalAmount ?? 0);
    const interestRate = Number(loan.interestRate ?? 0);
    const durationMonths = Number(loan.tenureMonths ?? 1);
    const totalRepayable = principal * (1 + (interestRate * durationMonths) / 1200);
    const totalPaid = Number(loan.totalPaid ?? 0);
    const totalExpected = Number(loan.totalExpected ?? totalRepayable);

    return {
      ...loan,
      id: loan.loanId ?? "",
      status: (loan.status as LoanStatus | undefined) ?? "active",
      name: loan.productName ?? loan.purpose ?? "Loan",
      provider: loan.partnerName ?? "Shohoj Rin",
      principal,
      interestRate,
      durationMonths,
      paidMonths: Number(loan.paidInstallments ?? 0),
      totalRepayable: totalExpected,
      amountRepaid: totalPaid,
      remainingBalance: Math.max(0, totalExpected - totalPaid),
      interestPaid: 0,
      feesPaid: 0,
      monthlyPayment: totalRepayable / durationMonths,
      nextPaymentDate: loan.expectedEndDate ?? "",
    };
  });
}

export async function getLoan(id: string) {
  return apiRequest<unknown>(`/loans/${id}`);
}

export async function getLoanTransactions(loanId: string) {
  return apiRequest<Transaction[]>(`/loans/${loanId}/transactions`);
}

export async function getRepaymentSchedule(loanId: string) {
  const data = await apiRequest<{ schedules: RepaymentScheduleEntry[] }>(
    `/repayments/loans/${loanId}/schedules`,
  );
  return data.schedules.map((schedule) => ({
    ...schedule,
    month: schedule.installmentNumber,
    principal: schedule.expectedAmount,
    interest: 0,
    total: schedule.expectedAmount,
    status: (
      schedule.status === "paid"
        ? "paid"
        : schedule.status === "overdue"
          ? "overdue"
          : schedule.status === "partially_paid"
            ? "due"
            : "upcoming"
    ) as RepaymentScheduleRow["status"],
  }));
}

export async function createRepayment(
  loanId: string,
  amount: number,
  method: string,
  payOffEarly = false,
) {
  const schedules = await getRepaymentSchedule(loanId);
  const outstandingSchedules = schedules.filter((schedule) => schedule.outstandingAmount > 0);
  if (outstandingSchedules.length === 0) {
    throw new Error("No repayment is currently due for this loan");
  }

  const paymentMethod =
    method === "bank"
      ? "bank_transfer"
      : method === "bkash" || method === "nagad"
        ? "mobile_money"
        : "other";

  if (!payOffEarly) {
    const nextSchedule = outstandingSchedules[0];
    return apiRequest<RepaymentResult>(`/repayments/payments`, {
      method: "POST",
      body: JSON.stringify({
        scheduleId: nextSchedule.scheduleId,
        amountPaid: nextSchedule.outstandingAmount,
        paymentMethod,
      }),
    });
  }

  let remainingAmount = Math.round(amount * 100) / 100;
  let result: RepaymentResult | null = null;
  for (const schedule of outstandingSchedules) {
    if (remainingAmount <= 0) break;
    const paymentAmount = Math.min(remainingAmount, schedule.outstandingAmount);
    result = await apiRequest<RepaymentResult>(`/repayments/payments`, {
      method: "POST",
      body: JSON.stringify({
        scheduleId: schedule.scheduleId,
        amountPaid: Math.round(paymentAmount * 100) / 100,
        paymentMethod,
      }),
    });
    remainingAmount = Math.round((remainingAmount - paymentAmount) * 100) / 100;
  }

  return result as RepaymentResult;
}
