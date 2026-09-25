import { apiRequest } from "../api";
import type { AppStatus } from "../../types";

export interface ApplicationRecord {
  id?: string;
  applicationId?: string;
  referenceCode?: string;
  productName?: string;
  purpose?: string;
  partnerName?: string;
  phone?: string;
  product?: string;
  amount?: number;
  requestedAmount?: number;
  durationMonths?: number;
  submitted?: string;
  submittedAt?: string;
  createdAt?: string;
  status?: AppStatus;
}

export async function createApplication(data: {
  requestedAmount: number;
  durationMonths: number;
  purpose: string;
  purposeDescription?: string;
  partnerId?: string;
  productId?: string;
  disbursementAccountId?: string;
}) {
  return apiRequest<unknown>("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function normalizeAppStatus(rawStatus?: string | null): AppStatus {
  if (!rawStatus) return "submitted";
  const s = rawStatus.replace(/_/g, "-");
  return s as AppStatus;
}

export async function getApplications(params?: { status?: string; page?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== "all") searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  const qs = searchParams.toString();
  const res = await apiRequest<{ applications: ApplicationRecord[]; total: number }>(
    `/applications${qs ? `?${qs}` : ""}`,
  );
  return {
    ...res,
    applications: (res.applications || []).map((app) => ({
      ...app,
      status: normalizeAppStatus(app.status),
    })),
  };
}

export async function getApplication(id: string) {
  return apiRequest<unknown>(`/applications/${id}`);
}
