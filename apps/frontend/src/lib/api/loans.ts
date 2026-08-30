import { apiRequest } from "../api";
import type { LoanProduct } from "@shohojrin/shared";

export async function getLoanProducts(params?: { category?: string; search?: string; page?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  const qs = searchParams.toString();
  return apiRequest<{ products: LoanProduct[]; total: number }>(`/loan-products${qs ? `?${qs}` : ''}`);
}

export async function getLoanProduct(id: string) {
  return apiRequest<LoanProduct>(`/loan-products/${id}`);
}

export async function getActiveLoans() {
  const data = await apiRequest<{ loans: any[] }>("/loans?status=active");
  return data.loans.map((loan) => {
    const principal = Number(loan.principalAmount ?? 0);
    const interestRate = Number(loan.interestRate ?? 0);
    const durationMonths = Number(loan.tenureMonths ?? 1);
    const totalRepayable = principal * (1 + (interestRate * durationMonths) / 1200);

    return {
      ...loan,
      id: loan.loanId,
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
      nextPaymentDate: loan.expectedEndDate,
    };
  });
}

export async function getLoan(id: string) {
  return apiRequest<any>(`/loans/${id}`);
}

export async function getLoanTransactions(loanId: string) {
  return apiRequest<any[]>(`/loans/${loanId}/transactions`);
}

export async function getRepaymentSchedule(loanId: string) {
  const data = await apiRequest<{ schedules: any[] }>(`/repayments/loans/${loanId}/schedules`);
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

  return apiRequest<any>(`/repayments/payments`, {
    method: "POST",
    body: JSON.stringify({
      scheduleId: nextSchedule.scheduleId,
      amountPaid: amount,
      paymentMethod,
    }),
  });
}
