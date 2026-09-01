import { apiRequest } from "../api";
import type { InvestorProfile } from "@shohojrin/shared";

export async function getInvestorProfile() {
  return apiRequest<InvestorProfile>("/investor/profile");
}

export async function updateInvestorProfile(data: Record<string, any>) {
  return apiRequest<InvestorProfile>("/investor/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getOpportunities() {
  return apiRequest<any[]>("/investor/opportunities");
}

export async function fundOpportunity(applicationId: string, amount: number) {
  return apiRequest<any>(`/investor/fund/${applicationId}`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function getPortfolio() {
  return apiRequest<any>("/investor/portfolio");
}

export async function rejectOpportunity(applicationId: string, reason?: string) {
  return apiRequest<any>(`/investor/applications/${applicationId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
