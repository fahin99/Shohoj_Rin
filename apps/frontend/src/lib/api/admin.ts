import { apiRequest } from "../api";

interface PlatformStats {
  applicationsToday: number;
  approvalRate: number;
  disbursedThisMonth: number;
  overdueAccounts: number;
}

export interface AdminUser {
  id: string;
  name: string;
  role: string;
  joined: string;
  status: string;
  createdAt?: string;
}

interface Partner {
  id: string;
  name: string;
  type: string;
  status: string;
  activeLoans: number;
  products?: number;
}

export async function getPlatformStats() {
  return apiRequest<PlatformStats>("/admin/stats");
}

export async function getUsers(params?: { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return apiRequest<{ users: AdminUser[]; total: number }>(`/admin/users${qs ? `?${qs}` : ""}`);
}

export async function getPartners() {
  return apiRequest<Partner[]>("/admin/partners");
}

export async function reviewApplication(
  id: string,
  data: { decision: "approved" | "rejected"; reason?: string },
) {
  return apiRequest<unknown>(`/admin/applications/${id}/review`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function reviewVerification(
  id: string,
  data: { status: "approved" | "rejected" | "needs_review"; notes?: string },
) {
  return apiRequest<unknown>(`/admin/verification/${id}/review`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
