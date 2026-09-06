import { apiRequest } from "../api";

interface PlatformStats {
  totalUsers: number;
  totalBorrowers: number;
  totalLenders: number;
  applicationsToday: number;
  approvalRate: number;
  totalDisbursed: number;
  overdueLoans: number;
  activeLoans: number;
  pendingVerifications: number;
}

export interface AdminUser {
  userId: string;
  email: string;
  phone: string | null;
  role: string;
  accountStatus: string;
  emailVerified: boolean;
  createdAt: string;
  fullName: string | null;
  profileCompletionStatus: string | null;
}

interface Partner {
  partnerId: string;
  name: string;
  type: string;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  createdAt: string;
  productCount: number;
  applicationCount: number;
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
