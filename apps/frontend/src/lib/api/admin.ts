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

export interface DatabaseOverview {
  users: number;
  borrowers: number;
  lenders: number;
  lendersWithInvestorProfile: number;
  loanApplications: number;
  activeLoans: number;
  repayments: number;
}

export interface LoanBalanceRow {
  loanId: string;
  loanStatus: string;
  principalAmount: number;
  applicationReference: string | null;
  applicationStatus: string;
  partnerName: string | null;
  installmentCount: number;
  paidInstallmentCount: number;
  nextDueDate: string | null;
  remainingBalance: number;
}

export interface DatabaseShowcaseQueries {
  loanPortfolio: Array<{
    loanStatus: string;
    loanCount: number;
    principalAmount: number;
    scheduledAmount: number;
    paidAmount: number;
  }>;
  lenderFunding: Array<{
    riskPreference: string;
    lenderCount: number;
    commitmentCount: number;
    committedAmount: number;
  }>;
  applicationTrust: Array<{
    applicationStatus: string;
    applicationCount: number;
    requestedAmount: number;
    averageTrustScore: number | null;
    committedAmount: number;
  }>;
}

export interface DatabaseTrigger {
  triggerName: string;
  tableName: string;
  event: string;
  enabled: boolean;
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

export async function getDatabaseOverview() {
  return apiRequest<DatabaseOverview>("/admin/database-showcase/overview");
}

export async function getDatabaseShowcaseQueries() {
  return apiRequest<DatabaseShowcaseQueries>("/admin/database-showcase/queries");
}

export async function getLoanBalanceShowcase(params: { page?: number; limit?: number } = {}) {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return apiRequest<{ loans: LoanBalanceRow[]; total: number }>(
    `/admin/database-showcase/loan-balances${query ? `?${query}` : ""}`,
  );
}

export async function getDatabaseTriggers() {
  return apiRequest<DatabaseTrigger[]>("/admin/database-showcase/triggers");
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
