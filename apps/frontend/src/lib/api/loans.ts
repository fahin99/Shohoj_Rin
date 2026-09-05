import { apiRequest } from "../api";
import type { LoanProduct } from "@shohojrin/shared";
import type { ActiveLoan, RepaymentScheduleRow, Transaction } from "../../types";

interface RawLoanData {
  principalAmount?: number | string;
  interestRate?: number | string;
  tenureMonths?: number | string;
  loanId?: string;
  productName?: string;
  purpose?: string;
  partnerName?: string;
  expectedEndDate?: string;
}

interface RepaymentScheduleEntry extends RepaymentScheduleRow {
  scheduleId: string;
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

export async function getActiveLoans(): Promise<ActiveLoan[]> {
  const data = await apiRequest<{ loans: RawLoanData[] }>("/loans?status=active");
  return data.loans.map((loan) => {
    const principal = Number(loan.principalAmount ?? 0);
    const interestRate = Number(loan.interestRate ?? 0);
    const durationMonths = Number(loan.tenureMonths ?? 1);
    const totalRepayable = principal * (1 + (interestRate * durationMonths) / 1200);

    return {
      ...loan,
      id: loan.loanId ?? "",
      name: loan.productName ?? loan.purpose ?? "Loan",
      provider: loan.partnerName ?? "Shohoj Rin",
      principal,
      interestRate,
      durationMonths,
      paidMonths: 0,
      totalRepayable,
      amountRepaid: 0,
      remainingBalance: principal,
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
  return data.schedules;
}

export async function createRepayment(loanId: string, amount: number, method: string) {
  const schedules = await getRepaymentSchedule(loanId);
  const nextSchedule = schedules.find((schedule) => schedule.outstandingAmount > 0);
  if (!nextSchedule) {
    throw new Error("No repayment is currently due for this loan");
  }

  const paymentMethod =
    method === "bank"
      ? "bank_transfer"
      : method === "bkash" || method === "nagad"
        ? "mobile_money"
        : "other";

  return apiRequest<RepaymentResult>(`/repayments/payments`, {
    method: "POST",
    body: JSON.stringify({
      scheduleId: nextSchedule.scheduleId,
      amountPaid: amount,
      paymentMethod,
    }),
  });
}
