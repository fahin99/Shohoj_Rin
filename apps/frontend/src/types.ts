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
  | "database-showcase"
  | "system-states"
  | "investor-onboarding"
  | "profile"
  | "settings";

export type LoanStatus =
  "pending_disbursement" | "active" | "completed" | "overdue" | "delinquent" | "defaulted";
export type AppStatus =
  | "submitted"
  | "under-review"
  | "under_review"
  | "info-required"
  | "info_required"
  | "approved"
  | "rejected"
  | "disbursed";
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
  scheduleId: string;
  month: number;
  dueDate: string;
  principal: number;
  interest: number;
  total: number;
  expectedAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: "paid" | "due" | "upcoming" | "overdue" | "partially_paid";
}

export interface ActiveLoan {
  id: string;
  status: LoanStatus;
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
