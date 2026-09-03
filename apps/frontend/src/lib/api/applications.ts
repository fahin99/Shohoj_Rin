import { apiRequest } from "../api";
import type { AppStatus } from "../../types";

export interface ApplicationRecord {
  id?: string;
  applicationId?: string;
  productName?: string;
  purpose?: string;
  partnerName?: string;
  phone?: string;
  product?: string;
  amount?: number;
  requestedAmount?: number;
  submitted?: string;
  submittedAt?: string;
  createdAt?: string;
  status?: AppStatus;
}

export async function createApplication(data: {
  requestedAmount: number;
  purpose: string;
  purposeDescription?: string;
  partnerId?: string;
  productId?: string;
}) {
  return apiRequest<unknown>("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getApplications(params?: { status?: string; page?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== "all") searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  const qs = searchParams.toString();
  return apiRequest<{ applications: ApplicationRecord[]; total: number }>(
    `/applications${qs ? `?${qs}` : ""}`,
  );
}

export async function getApplication(id: string) {
  return apiRequest<unknown>(`/applications/${id}`);
}
