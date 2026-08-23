
export type UserRole = "borrower" | "lender" | "admin" | "reviewer";
export type AccountStatus = "active" | "suspended" | "deactivated";
export type LoanStatus =
  | "active"
  | "pending"
  | "approved"
  | "rejected"
  | "disbursed"
  | "closed"
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
  | "disbursed";
export type TransactionType = "payment" | "repayment" | "disbursement" | "fee" | "refund";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type VerificationType = "identity" | "student" | "document" | "guarantor";
export type TrustBand = "very_low_risk" | "low_risk" | "moderate_risk" | "high_risk" | "very_high_risk";
export type FraudSeverity = "low" | "medium" | "high" | "critical";
export type NotificationChannel = "email" | "sms" | "in_app";
export type PageName =
  | "landing"
  | "auth"
  | "onboarding"
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
