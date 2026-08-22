import { useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { DataTable, type Column } from "../components/DataTable";
import { Badge, LoanStatusBadge } from "../components/Badge";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/Progress";
import { formatTaka, formatPercent } from "../lib/format";
import type { PageName, LoanStatus } from "../types";
import { getDisplayName, type StoredUserProfile } from "../lib/session";
interface Props {
  onNavigate: (page: PageName) => void;
  user: StoredUserProfile;
}
interface FundedLoan {
  id: string;
  borrowerAlias: string;
  product: string;
  amount: number;
  rate: number;
  tenure: number;
  repaidPct: number;
  status: LoanStatus;
}
const fundedLoans: FundedLoan[] = [
  {
    id: "SR-2026-004812",
    borrowerAlias: "Borrower R.A.",
    product: "Student Tuition Support Loan",
    amount: 200000,
    rate: 8.5,
    tenure: 48,
    repaidPct: 29,
    status: "active",
  },
  {
    id: "SR-2026-004531",
    borrowerAlias: "Borrower M.K.",
    product: "Small Business Working Capital Facility",
    amount: 450000,
    rate: 12,
    tenure: 36,
    repaidPct: 62,
    status: "active",
  },
  {
    id: "SR-2026-004229",
    borrowerAlias: "Borrower S.J.",
    product: "Emergency Medical Assistance",
    amount: 60000,
    rate: 10.5,
    tenure: 24,
    repaidPct: 100,
    status: "closed",
  },
  {
    id: "SR-2026-004108",
    borrowerAlias: "Borrower T.H.",
    product: "Personal Flexible Loan",
    amount: 120000,
    rate: 11.25,
    tenure: 30,
    repaidPct: 8,
    status: "overdue",
  },
  {
    id: "SR-2026-003987",
    borrowerAlias: "Borrower N.A.",
    product: "Rural Entrepreneur Growth Loan",
    amount: 300000,
    rate: 10,
    tenure: 24,
    repaidPct: 45,
    status: "active",
  },
];
interface Opportunity {
  id: string;
  product: string;
  provider: string;
  amount: number;
  rate: number;
  tenure: number;
  risk: "Low" | "Medium" | "High";
}
const opportunities: Opportunity[] = [
  {
    id: "op-1",
    product: "Skills & Professional Development Loan",
    provider: "Shohoj Learn Finance",
    amount: 80000,
    rate: 9,
    tenure: 18,
    risk: "Low",
  },
  {
    id: "op-2",
    product: "Small Business Working Capital Facility",
    provider: "Dhaka Trade Credit",
    amount: 350000,
    rate: 12,
    tenure: 36,
    risk: "Medium",
  },
  {
    id: "op-3",
    product: "Emergency Medical Assistance",
    provider: "Shohoj Care Finance",
    amount: 45000,
    rate: 10.5,
    tenure: 24,
    risk: "Medium",
  },
];
const monthlyPerformance = [
  { month: "Feb", deployed: 320000 },
  { month: "Mar", deployed: 410000 },
  { month: "Apr", deployed: 380000 },
  { month: "May", deployed: 520000 },
  { month: "Jun", deployed: 610000 },
  { month: "Jul", deployed: 700000 },
];
const riskBreakdown = [
  { label: "Low risk", value: 58, color: "emerald" as const },
  { label: "Medium risk", value: 32, color: "yellow" as const },
  { label: "High risk", value: 10, color: "coral" as const },
];
export default function LenderDashboard({ onNavigate, user }: Props) {
  const [funded, setFunded] = useState<Set<string>>(new Set());
  const userName = getDisplayName(user, "Tanvir Hossain");
  const firstName = userName.split(" ")[0] ?? userName;
  const columns: Column<FundedLoan>[] = [
    {
      key: "borrower",
      header: "Borrower",
      render: (r) => <span className="font-medium">{r.borrowerAlias}</span>,
    },
    {
      key: "product",
      header: "Product",
      hideBelow: "md",
      render: (r) => <span className="text-stone-500">{r.product}</span>,
    },
    { key: "amount", header: "Amount", numeric: true, render: (r) => formatTaka(r.amount) },
    {
      key: "rate",
      header: "Rate",
      numeric: true,
      hideBelow: "sm",
      render: (r) => formatPercent(r.rate),
    },
    {
      key: "tenure",
      header: "Tenure",
      numeric: true,
      hideBelow: "lg",
      render: (r) => `${r.tenure} mo`,
    },
    { key: "repaid", header: "Repaid", numeric: true, render: (r) => `${r.repaidPct}%` },
    { key: "status", header: "Status", render: (r) => <LoanStatusBadge status={r.status} /> },
  ];
  const maxDeployed = Math.max(...monthlyPerformance.map((m) => m.deployed));
  return (
    <AppLayout
      onNavigate={onNavigate}
      currentPage="lender-dashboard"
      userType="lender"
      userName={userName}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          eyebrow="Lender portfolio"
          title={`Welcome back, ${firstName}`}
          description="Track your deployed capital, funded loans, and new funding opportunities."
          actions={
            <Button variant="primary" size="sm" onClick={() => onNavigate("loan-marketplace")}>
              Find opportunities
            </Button>
          }
        />
        {}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            label="Total deployed"
            value={formatTaka(2340000)}
            hint="Across 5 active loans"
          />
          <StatCard label="Active loans" value="4" hint="1 closed this year" />
          <StatCard label="Average yield" value={formatPercent(10.4)} tone="positive" />
          <StatCard label="Repayment rate" value="96%" tone="positive" hint="Last 12 months" />
          <StatCard
            label="At-risk exposure"
            value={formatTaka(120000)}
            tone="critical"
            hint="1 overdue loan"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          {}
          <div className="lg:col-span-2 bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5 min-w-0">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between items-start mb-5">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-navy">Capital deployed over time</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Monthly disbursed amount, last 6 months
                </p>
              </div>
            </div>
            <div className="flex items-end gap-3 sm:gap-4 h-40 px-1">
              {monthlyPerformance.map((m) => (
                <div
                  key={m.month}
                  className="flex-1 min-w-0 flex flex-col items-center justify-end gap-2 h-full"
                >
                  <span className="text-[10px] tabular-nums text-stone-500 whitespace-nowrap">
                    {formatTaka(m.deployed)}
                  </span>
                  <div
                    className="w-full max-w-8 bg-teal rounded-t-[3px] border border-navy/10"
                    style={{ height: `${Math.max(6, (m.deployed / maxDeployed) * 100)}%` }}
                  />
                  <span className="text-xs text-stone-500">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
          {}
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5 min-w-0">
            <h2 className="text-sm font-semibold text-navy mb-4">Risk distribution</h2>
            <div className="flex flex-col gap-4">
              {riskBreakdown.map((r) => (
                <ProgressBar
                  key={r.label}
                  label={r.label}
                  value={r.value}
                  showValue
                  color={r.color}
                />
              ))}
            </div>
          </div>
        </div>
        {}
        <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] mb-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between items-center px-5 py-4 border-b border-stone-200">
            <h2 className="text-sm font-semibold text-navy min-w-0">Funded loans</h2>
            <span className="text-xs text-stone-500 shrink-0">{fundedLoans.length} loans</span>
          </div>
          <DataTable
            caption="Funded loans"
            columns={columns}
            rows={fundedLoans}
            rowKey={(r) => r.id}
          />
        </div>
        {}
        <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5">
          <h2 className="text-sm font-semibold text-navy mb-4">New funding opportunities</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((op) => {
              const isFunded = funded.has(op.id);
              return (
                <div
                  key={op.id}
                  className="border-[1.5px] border-stone-200 rounded-[6px] p-4 flex flex-col gap-3 min-w-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-navy truncate">{op.product}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{op.provider}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-stone-400">Amount</p>
                      <p className="tabular-nums font-medium text-navy">{formatTaka(op.amount)}</p>
                    </div>
                    <div>
                      <p className="text-stone-400">Rate</p>
                      <p className="tabular-nums font-medium text-navy">{formatPercent(op.rate)}</p>
                    </div>
                    <div>
                      <p className="text-stone-400">Tenure</p>
                      <p className="tabular-nums font-medium text-navy">{op.tenure} mo</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-stone-100">
                    <Badge
                      variant={
                        op.risk === "Low" ? "success" : op.risk === "Medium" ? "warning" : "error"
                      }
                      size="sm"
                      dot
                    >
                      {op.risk} risk
                    </Badge>
                    <Button
                      variant={isFunded ? "secondary" : "primary"}
                      size="xs"
                      disabled={isFunded}
                      onClick={() => setFunded((prev) => new Set(prev).add(op.id))}
                    >
                      {isFunded ? "Funded" : "Fund"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
