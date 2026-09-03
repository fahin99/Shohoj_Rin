import { apiRequest } from "../api";
import type { InvestorProfile } from "@shohojrin/shared";

interface TrustFactor {
  name: string;
  score: number;
  weight: number | null;
  description: string | null;
}

export interface Opportunity {
  applicationId: string;
  borrowerName: string | null;
  purpose: string | null;
  purposeDescription?: string | null;
  requestedAmount: number;
  status: string;
  submittedAt: string | null;
  productId: string | null;
  productName: string | null;
  category: string | null;
  interestRate: number | null;
  durationMonths: number | null;
  partnerName: string | null;
  trustScoreId: string | null;
  trustBand: string | null;
  trustScore: number | null;
  identityVerified?: boolean;
  addressVerified?: boolean;
  incomeVerified?: boolean;
  nidOnFile?: boolean;
  committedAmount: number;
  trustFactors: TrustFactor[];
}

export interface PortfolioResponse {
  fundedLoans: Record<string, unknown>[];
  totalDeployed: number;
  activeLoans: number;
  averageYield: number;
  repaymentRate: number;
  atRiskExposure: number;
  monthlyPerformance: { month: string; deployed: number }[];
  riskBreakdown: { label: string; value: number; color: "emerald" | "yellow" | "coral" }[];
}

export async function getInvestorProfile() {
  return apiRequest<InvestorProfile>("/investor/profile");
}

export async function updateInvestorProfile(data: Record<string, unknown>) {
  return apiRequest<InvestorProfile>("/investor/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getOpportunities() {
  return apiRequest<Opportunity[]>("/investor/opportunities");
}

export async function fundOpportunity(applicationId: string, amount: number) {
  return apiRequest<unknown>(`/investor/fund/${applicationId}`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function getPortfolio() {
  return apiRequest<PortfolioResponse>("/investor/portfolio");
}

export async function rejectOpportunity(applicationId: string, reason?: string) {
  return apiRequest<unknown>(`/investor/applications/${applicationId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}
