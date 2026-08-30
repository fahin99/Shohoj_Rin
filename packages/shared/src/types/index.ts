export type UserRole = "borrower" | "lender" | "partner_agent" | "admin";
export type AccountStatus = "active" | "suspended" | "deactivated";
export type LoanStatus =
  | "active"
  | "completed"
  | "overdue"
  | "defaulted"
  | "delinquent";
export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under-review"
  | "info-required"
  | "approved"
  | "rejected"
  | "disbursed"
  | "active"
  | "completed"
  | "overdue"
  | "defaulted";
export type TransactionType = "payment" | "repayment" | "disbursement" | "fee" | "refund";
export type VerificationStatus = "pending" | "approved" | "rejected" | "needs_review";
export type VerificationType = "identity" | "student" | "document" | "guarantor" | "income" | "address";
export type VerificationSource = "manual_review" | "external_provider" | "demo_verification";
export type ProfileCompletionStatus =
  | "incomplete"
  | "pending_verification"
  | "under_review"
  | "verified"
  | "rejected"
  | "needs_update";
export type DocumentStatus =
  | "pending_upload"
  | "uploaded"
  | "under_review"
  | "verified"
  | "rejected"
  | "needs_resubmission"
  | "demo_verified";
export type TrustBand =
  "very_low_risk" | "low_risk" | "moderate_risk" | "high_risk" | "very_high_risk";
export type FraudSeverity = "low" | "medium" | "high" | "critical";
export type NotificationChannel = "email" | "sms" | "in_app";
export type PageName =
  | "landing"
  | "auth"
  | "onboarding"
  | "investor-onboarding"
  | "borrower-dashboard"
  | "loan-marketplace"
  | "loan-details"
  | "loan-application"
  | "application-status"
  | "active-loan"
  | "repayment"
  | "education"
  | "lender-dashboard"
  | "admin"
  | "system-states";
export interface LoanProduct {
  id: string;
  name: string;
  provider: string;
  category: "education" | "emergency" | "business" | "personal" | "development";
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  durationMonths: number;
  description: string;
  eligibility: string[];
  tags: string[];
}
export interface LoanProductDetail extends LoanProduct {
  partnerId: string;
  isActive: boolean;
}
export interface InvestorProfile {
  investorProfileId: string;
  userId: string;
  displayName: string | null;
  verificationStatus: VerificationStatus;
  fundingCapacity: number | null;
  preferredCategories: string[];
  riskPreference: "conservative" | "moderate" | "aggressive" | null;
  maxExposure: number | null;
  accountStatus: AccountStatus;
  kycStatus: ProfileCompletionStatus;
  createdAt: string;
  updatedAt: string;
}
export interface AssessmentResult {
  documentType: string;
  status: DocumentStatus;
  confidence: number | null;
  validity: boolean;
  reason: string | null;
  trustSignal: "positive" | "negative" | "neutral" | "incomplete";
  assessmentTimestamp: string;
  assessmentSource: VerificationSource;
}
export interface ProfileCompletionItem {
  key: string;
  label: string;
  completed: boolean;
  required: boolean;
}
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  status: "completed" | "pending" | "failed";
}
export interface RepaymentScheduleRow {
  month: number;
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  status: "paid" | "due" | "upcoming" | "overdue";
}
export interface NavItem {
  label: string;
  page?: PageName;
  icon?: string;
  badge?: number;
}
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    stack?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
