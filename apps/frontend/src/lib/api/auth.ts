import { apiRequest } from "../api";

export async function registerUser(data: {
  username: string;
  email: string;
  phone?: string;
  password: string;
  role?: "borrower" | "lender";
}) {
  return apiRequest<{ user: Record<string, unknown> }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: { identifier: string; password: string }) {
  return apiRequest<{ user: Record<string, unknown> }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logoutUser() {
  return apiRequest<{ message: string }>("/auth/logout", { method: "POST" });
}

export async function getSession() {
  return apiRequest<{
    authenticated: boolean;
    user: Record<string, unknown>;
    session: Record<string, unknown>;
  }>("/auth/session");
}
