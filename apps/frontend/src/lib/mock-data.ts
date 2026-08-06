import type { LoanProduct, RepaymentScheduleRow, Transaction } from "../types";

export const loanProducts: LoanProduct[] = [
  {
    id: "lp-01",
    name: "Student Tuition Support Loan",
    provider: "Bengal Microfinance Bank",
    category: "education",
    minAmount: 20000,
    maxAmount: 500000,
    interestRate: 8,
    durationMonths: 48,
    description:
      "Cover tuition, books, and living costs while you study. Repayments begin six months after your course ends.",
    eligibility: ["Enrolled in a recognised institution", "Bangladeshi NID", "Guarantor required above ৳2,00,000"],
    tags: ["No collateral", "Grace period", "Popular"],
  },
  {
    id: "lp-02",
    name: "Emergency Medical Assistance",
    provider: "Shohoj Care Finance",
    category: "emergency",
    minAmount: 10000,
    maxAmount: 200000,
    interestRate: 10.5,
    durationMonths: 24,
    description: "Fast approval for urgent medical bills, hospital admissions, and critical treatment costs.",
    eligibility: ["Age 21–60", "Proof of income", "Hospital estimate or invoice"],
    tags: ["24h approval", "No collateral"],
  },
  {
    id: "lp-03",
    name: "Small Business Working Capital Facility",
    provider: "Dhaka Trade Credit",
    category: "business",
    minAmount: 50000,
    maxAmount: 1500000,
    interestRate: 12,
    durationMonths: 36,
    description: "Working capital and equipment financing for registered small businesses and shop owners.",
    eligibility: ["Trade licence", "12 months of trading history", "Bank statements"],
    tags: ["Flexible tenure", "Business"],
  },
  {
    id: "lp-04",
    name: "Skills & Professional Development Loan",
    provider: "Shohoj Learn Finance",
    category: "development",
    minAmount: 10000,
    maxAmount: 100000,
    interestRate: 9,
    durationMonths: 18,
    description: "Fund certifications, professional courses, and career training with small monthly instalments.",
    eligibility: ["Age 18+", "Course admission letter"],
    tags: ["Low ticket", "Fast"],
  },
  {
    id: "lp-05",
    name: "Personal Flexible Loan",
    provider: "Bengal Microfinance Bank",
    category: "personal",
    minAmount: 15000,
    maxAmount: 300000,
    interestRate: 11.25,
    durationMonths: 30,
    description: "A general-purpose loan with transparent pricing and no prepayment penalty.",
    eligibility: ["Salaried or self-employed", "Minimum monthly income ৳20,000"],
    tags: ["No prepayment fee"],
  },
  {
    id: "lp-06",
    name: "Rural Entrepreneur Growth Loan",
    provider: "Padma Rural Finance",
    category: "business",
    minAmount: 25000,
    maxAmount: 400000,
    interestRate: 10,
    durationMonths: 24,
    description: "Designed for rural micro-entrepreneurs expanding stock, tools, or storage capacity.",
    eligibility: ["Village business registration", "Community guarantor"],
    tags: ["Community backed"],
  },
];

export const transactions: Transaction[] = [
  { id: "t-1", date: "2026-07-15", description: "EMI payment — Student Tuition Support Loan", amount: 4500, type: "repayment", status: "completed" },
  { id: "t-2", date: "2026-06-15", description: "EMI payment — Student Tuition Support Loan", amount: 4500, type: "repayment", status: "completed" },
  { id: "t-3", date: "2026-06-02", description: "Late payment fee reversal (goodwill adjustment)", amount: 250, type: "refund", status: "completed" },
  { id: "t-4", date: "2026-05-15", description: "EMI payment — Student Tuition Support Loan", amount: 4500, type: "repayment", status: "completed" },
  { id: "t-5", date: "2026-05-01", description: "Processing fee — Emergency Medical Assistance application", amount: 750, type: "fee", status: "completed" },
  { id: "t-6", date: "2026-04-20", description: "Loan disbursement — Emergency Medical Assistance", amount: 60000, type: "disbursement", status: "completed" },
  { id: "t-7", date: "2026-04-15", description: "EMI payment — Student Tuition Support Loan", amount: 4500, type: "repayment", status: "failed" },
  { id: "t-8", date: "2026-03-15", description: "EMI payment — Student Tuition Support Loan", amount: 4500, type: "repayment", status: "completed" },
];

export const repaymentSchedule: RepaymentScheduleRow[] = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1;
  const status: RepaymentScheduleRow["status"] =
    month < 8 ? "paid" : month === 8 ? "due" : month === 7 ? "overdue" : "upcoming";
  return {
    month,
    dueDate: `2026-${String(((month + 2) % 12) + 1).padStart(2, "0")}-15`,
    principal: 3080,
    interest: 1420,
    total: 4500,
    status,
  };
});

export const activeLoan = {
  id: "SR-2026-004812",
  name: "Student Tuition Support Loan",
  provider: "Bengal Microfinance Bank",
  principal: 200000,
  interestRate: 8.5,
  durationMonths: 48,
  paidMonths: 14,
  totalRepayable: 236000,
  amountRepaid: 63000,
  remainingBalance: 173000,
  interestPaid: 19880,
  feesPaid: 750,
  monthlyPayment: 4500,
  nextPaymentDate: "2026-08-15",
};

export const applications = [
  {
    id: "APP-9021",
    product: "Emergency Medical Assistance",
    provider: "Shohoj Care Finance",
    amount: 60000,
    submitted: "2026-07-02",
    status: "under-review" as const,
    stage: 2,
  },
  {
    id: "APP-8877",
    product: "Small Business Working Capital Facility",
    provider: "Dhaka Trade Credit",
    amount: 450000,
    submitted: "2026-06-18",
    status: "info-required" as const,
    stage: 2,
  },
  {
    id: "APP-8420",
    product: "Student Tuition Support Loan",
    provider: "Bengal Microfinance Bank",
    amount: 200000,
    submitted: "2025-05-11",
    status: "disbursed" as const,
    stage: 4,
  },
  {
    id: "APP-8103",
    product: "Personal Flexible Loan",
    provider: "Bengal Microfinance Bank",
    amount: 120000,
    submitted: "2025-02-27",
    status: "rejected" as const,
    stage: 3,
  },
];

export const educationArticles = [
  { id: "ed-1", title: "Understanding interest rates", tag: "Basics", read: "4 min read", desc: "How simple and compound interest change the total you repay — with worked examples in taka." },
  { id: "ed-2", title: "How loan repayment actually works", tag: "Repayment", read: "5 min read", desc: "EMIs, amortisation, and how each payment splits between principal and interest." },
  { id: "ed-3", title: "What affects the cost of your loan", tag: "Credit", read: "3 min read", desc: "Duration, amount, and credit history — the three factors that move your rate the most." },
  { id: "ed-4", title: "Building a repayment budget you can keep", tag: "Planning", read: "6 min read", desc: "A simple monthly framework so instalments never catch you by surprise." },
  { id: "ed-5", title: "Reading the fine print without fear", tag: "Basics", read: "4 min read", desc: "Processing fees, late charges, prepayment terms — what to check before signing." },
  { id: "ed-6", title: "What to do if you might miss a payment", tag: "Support", read: "5 min read", desc: "Restructuring, grace periods, and how to talk to your lender early." },
];
