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
  return apiRequest<any[]>("/loans");
}

export async function getLoan(id: string) {
  return apiRequest<any>(`/loans/${id}`);
}

export async function getLoanTransactions(loanId: string) {
  return apiRequest<any[]>(`/loans/${loanId}/transactions`);
}

export async function getRepaymentSchedule(loanId: string) {
  return apiRequest<any>(`/repayments/loans/${loanId}/schedules`);
}

export async function createRepayment(loanId: string, amount: number, method: string) {
  return apiRequest<any>(`/repayments`, {
    method: "POST",
    body: JSON.stringify({ loanId, amount, paymentMethod: method }),
  });
}
