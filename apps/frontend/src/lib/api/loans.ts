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
}

export interface MvpRepaymentResult {
  schedule: RepaymentScheduleEntry;
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
    expectedAmount: schedule.expectedAmount,
    paidAmount: schedule.paidAmount ?? schedule.totalPaid ?? 0,
    outstandingAmount: schedule.outstandingAmount ?? 0,
    status: (
      schedule.status === "paid"
        ? "paid"
        : schedule.status === "partially_paid"
          ? "partially_paid"
          : schedule.status === "overdue"
            ? "overdue"
            : schedule.outstandingAmount > 0 && schedule.outstandingAmount < schedule.expectedAmount
              ? "partially_paid"
              : "upcoming"
    ) as RepaymentScheduleRow["status"],
  }));
}

export async function createRepayment(
  scheduleId: string,
  amountPaid: number,
) {
  return apiRequest<MvpRepaymentResult>(`/repayments/payments`, {
    method: "POST",
    body: JSON.stringify({
      scheduleId,
      amountPaid: Math.round(amountPaid * 100) / 100,
    }),
  });
}

