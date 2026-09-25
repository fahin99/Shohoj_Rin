import { apiRequest } from "../api";
import type {
  UserPaymentAccount,
  CreatePaymentAccountInput,
  UpdatePaymentAccountInput,
} from "@shohojrin/shared";

export async function getPaymentAccounts(): Promise<UserPaymentAccount[]> {
  const res = await apiRequest<{ accounts: UserPaymentAccount[] }>("/payment-accounts");
  return res.accounts || [];
}

export async function getPaymentAccount(id: string): Promise<UserPaymentAccount> {
  return apiRequest<UserPaymentAccount>(`/payment-accounts/${id}`);
}

export async function createPaymentAccount(
  data: CreatePaymentAccountInput,
): Promise<UserPaymentAccount> {
  return apiRequest<UserPaymentAccount>("/payment-accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updatePaymentAccount(
  id: string,
  data: UpdatePaymentAccountInput,
): Promise<UserPaymentAccount> {
  return apiRequest<UserPaymentAccount>(`/payment-accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function setDefaultPaymentAccount(id: string): Promise<UserPaymentAccount> {
  return apiRequest<UserPaymentAccount>(`/payment-accounts/${id}/default`, {
    method: "PATCH",
  });
}

export async function deletePaymentAccount(id: string): Promise<{ deleted: boolean }> {
  return apiRequest<{ deleted: boolean }>(`/payment-accounts/${id}`, {
    method: "DELETE",
  });
}
