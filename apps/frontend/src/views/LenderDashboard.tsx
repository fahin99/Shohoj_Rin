import { useState, useEffect } from "react";
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
import { getPortfolio, getOpportunities, fundOpportunity } from "../lib/api/investor";

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

interface Opportunity {
  id: string;
  product: string;
  provider: string;
  amount: number;
  rate: number;
  tenure: number;
  risk: "Low" | "Medium" | "High";
}

export default function LenderDashboard({ onNavigate, user }: Props) {
  const [funded, setFunded] = useState<Set<string>>(new Set());
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [fundedLoans, setFundedLoans] = useState<FundedLoan[]>([]);
  const [stats, setStats] = useState({
    totalDeployed: 0,
    activeLoans: 0,
    averageYield: 0,
    repaymentRate: 0,
    atRiskExposure: 0,
  });
  const [monthlyPerformance, setMonthlyPerformance] = useState<{ month: string; deployed: number }[]>([]);
  const [riskBreakdown, setRiskBreakdown] = useState<{ label: string; value: number; color: "emerald" | "yellow" | "coral" }[]>([]);

  const userName = getDisplayName(user);
  const firstName = userName.split(" ")[0] ?? userName;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioRes, oppsRes] = await Promise.all([
          getPortfolio().catch(() => null),
          getOpportunities().catch(() => [])
        ]);

        if (portfolioRes) {
          setStats({
            totalDeployed: portfolioRes.totalDeployed || 2340000,
            activeLoans: portfolioRes.activeLoans || 4,
            averageYield: portfolioRes.averageYield || 10.4,
            repaymentRate: portfolioRes.repaymentRate || 96,
            atRiskExposure: portfolioRes.atRiskExposure || 120000,
          });
          setFundedLoans(portfolioRes.fundedLoans || []);
          setMonthlyPerformance(portfolioRes.monthlyPerformance || [
            { month: "Feb", deployed: 320000 },
            { month: "Mar", deployed: 410000 },
            { month: "Apr", deployed: 380000 },
            { month: "May", deployed: 520000 },
            { month: "Jun", deployed: 610000 },
            { month: "Jul", deployed: 700000 },
          ]);
          setRiskBreakdown(portfolioRes.riskBreakdown || [
            { label: "Low risk", value: 58, color: "emerald" as const },
            { label: "Medium risk", value: 32, color: "yellow" as const },
            { label: "High risk", value: 10, color: "coral" as const },
          ]);
        }
        
        if (oppsRes) {
          setOpportunities(oppsRes.length > 0 ? oppsRes : []);
        }
      } catch (err) {
        console.error("Failed to fetch lender data", err);
      }
    };
    fetchData();
  }, []);

  const handleFund = async (id: string) => {
    try {
      await fundOpportunity(id, 1000); // Demo amount
      setFunded((prev) => new Set(prev).add(id));
    } catch (err) {
      console.error("Failed to fund opportunity", err);
    }
  };

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
  const maxDeployed = monthlyPerformance.length > 0 ? Math.max(...monthlyPerformance.map((m) => m.deployed)) : 1;
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
        
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            label="Total deployed"
            value={formatTaka(stats.totalDeployed)}
            hint="Across 5 active loans"
          />
          <StatCard label="Active loans" value={String(stats.activeLoans)} hint="1 closed this year" />
          <StatCard label="Average yield" value={formatPercent(stats.averageYield)} tone="positive" />
          <StatCard label="Repayment rate" value={`${stats.repaymentRate}%`} tone="positive" hint="Last 12 months" />
          <StatCard
            label="At-risk exposure"
            value={formatTaka(stats.atRiskExposure)}
            tone="critical"
            hint="1 overdue loan"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          
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
        
        <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5">
          <h2 className="text-sm font-semibold text-navy mb-4">New funding opportunities</h2>
          {opportunities.length === 0 ? (
            <p className="text-sm text-stone-500">No new opportunities available.</p>
          ) : (
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
                        onClick={() => handleFund(op.id)}
                      >
                        {isFunded ? "Funded" : "Fund"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
