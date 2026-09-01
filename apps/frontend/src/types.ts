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
  | "lender-opportunities"
  | "admin"
  | "system-states"
  | "investor-onboarding";

export type LoanStatus = "active" | "completed" | "overdue" | "delinquent" | "defaulted";
export type AppStatus =
  "submitted" | "under-review" | "info-required" | "approved" | "rejected" | "disbursed";
export type TransactionType = "payment" | "repayment" | "disbursement" | "fee" | "refund";

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

export interface ActiveLoan {
  id: string;
  name: string;
  provider: string;
  principal: number;
  interestRate: number;
  durationMonths: number;
  paidMonths: number;
  totalRepayable: number;
  amountRepaid: number;
  remainingBalance: number;
  interestPaid: number;
  feesPaid: number;
  monthlyPayment: number;
  nextPaymentDate: string;
}

export interface NavItem {
  label: string;
  page?: PageName;
  icon?: string;
  badge?: number;
}
