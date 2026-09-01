import { apiRequest } from "../api";

export async function getPlatformStats() {
  return apiRequest<any>("/admin/stats");
}

export async function getUsers(params?: { page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const qs = searchParams.toString();
  return apiRequest<{ users: any[]; total: number }>(`/admin/users${qs ? `?${qs}` : ""}`);
}

export async function getPartners() {
  return apiRequest<any[]>("/admin/partners");
}

export async function reviewApplication(
  id: string,
  data: { decision: "approved" | "rejected"; reason?: string },
) {
  return apiRequest<any>(`/admin/applications/${id}/review`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function reviewVerification(
  id: string,
  data: { status: "approved" | "rejected" | "needs_review"; notes?: string },
) {
  return apiRequest<any>(`/admin/verification/${id}/review`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
