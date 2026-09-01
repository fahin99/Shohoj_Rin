import { apiRequest } from "../api";

export async function createApplication(data: {
  requestedAmount: number;
  purpose: string;
  purposeDescription?: string;
  partnerId?: string;
  productId?: string;
}) {
  return apiRequest<any>("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getApplications(params?: { status?: string; page?: number }) {
  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== "all") searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  const qs = searchParams.toString();
  return apiRequest<{ applications: any[]; total: number }>(`/applications${qs ? `?${qs}` : ""}`);
}

export async function getApplication(id: string) {
  return apiRequest<any>(`/applications/${id}`);
}
