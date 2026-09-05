import { useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { StatCard } from "../components/StatCard";
import { DataTable, type Column } from "../components/DataTable";
import { Badge, LoanStatusBadge } from "../components/Badge";
import { Button } from "../components/Button";
import { ProgressBar } from "../components/Progress";
import { CurrencyInput } from "../components/Input";
import { formatTaka, formatPercent, formatDate } from "../lib/format";
import type { PageName, LoanStatus } from "../types";
import { getDisplayName, type StoredUserProfile } from "../lib/session";
import {
  getPortfolio,
  getOpportunities,
  fundOpportunity,
  rejectOpportunity,
} from "../lib/api/investor";

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
  remainingAmount: number;
  nextDueDate: string | null;
  status: LoanStatus;
}

interface TrustFactor {
  name: string;
  score: number;
  weight: number | null;
  description: string | null;
}

interface Opportunity {
  applicationId: string;
  borrowerName: string | null;
  borrowerProfileStatus?: string | null;
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

const trustBandDisplay: Record<string, { label: string; tone: "success" | "warning" | "error" }> = {
  very_low_risk: { label: "Very Low Risk", tone: "success" },
  low_risk: { label: "Low Risk", tone: "success" },
  moderate_risk: { label: "Moderate Risk", tone: "warning" },
  high_risk: { label: "High Risk", tone: "error" },
  very_high_risk: { label: "Very High Risk", tone: "error" },
};

export default function LenderDashboard({ onNavigate, user }: Props) {
  const [funded, setFunded] = useState<Set<string>>(new Set());
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [fundedLoans, setFundedLoans] = useState<FundedLoan[]>([]);
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set());
  const [fundAmounts, setFundAmounts] = useState<Record<string, number>>({});
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [statsState, setStatsState] = useState({
    totalDeployed: 0,
    activeLoans: 0,
    averageYield: 0,
    repaymentRate: 0,
    atRiskExposure: 0,
  });
  const [monthlyPerformance, setMonthlyPerformance] = useState<
    { month: string; deployed: number }[]
  >([]);
  const [riskBreakdown, setRiskBreakdown] = useState<
    { label: string; value: number; color: "emerald" | "yellow" | "coral" }[]
  >([]);

  const userName = getDisplayName(user);
  const firstName = userName.split(" ")[0] ?? userName;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [portfolioRes, oppsRes] = await Promise.all([
          getPortfolio().catch((error) => {
            console.error("Failed to fetch portfolio", error);
            return null;
          }),
          getOpportunities().catch((error) => {
            console.error("Failed to fetch opportunities", error);
            return [];
          }),
        ]);

        if (portfolioRes && typeof portfolioRes === "object") {
          const funded: FundedLoan[] = (
            (portfolioRes.fundedLoans as Array<Record<string, unknown>>) ?? []
          ).map((row) => ({
            id: String(row.commitmentId ?? row.applicationId ?? ""),
            borrowerAlias: String(row.borrowerName ?? "Borrower"),
            product: String(row.productName ?? row.purpose ?? "Loan"),
            amount: Number(row.fundedAmount ?? 0),
            rate: Number(row.interestRate ?? 0),
            tenure: Number(row.durationMonths ?? 0),
            repaidPct: Number(row.repaidPct ?? 0),
            remainingAmount: Number(row.remainingAmount ?? 0),
            nextDueDate: (row.nextDueDate as string | null) ?? null,
            status: (row.loanStatus as LoanStatus | undefined) ?? "active",
          }));
          setFundedLoans(funded);

          const totalDeployed = funded.reduce((sum: number, l: FundedLoan) => sum + l.amount, 0);
          const activeLoans = funded.filter((l: FundedLoan) => l.status === "active").length;
          setStatsState({
            totalDeployed: portfolioRes.totalDeployed ?? totalDeployed,
            activeLoans: portfolioRes.activeLoans ?? activeLoans,
            averageYield: portfolioRes.averageYield ?? 0,
            repaymentRate: portfolioRes.repaymentRate ?? 0,
            atRiskExposure: portfolioRes.atRiskExposure ?? 0,
          });
          setMonthlyPerformance(portfolioRes.monthlyPerformance ?? []);
          setRiskBreakdown(
            portfolioRes.riskBreakdown ?? [
              { label: "Low risk", value: 58, color: "emerald" as const },
              { label: "Medium risk", value: 32, color: "yellow" as const },
              { label: "High risk", value: 10, color: "coral" as const },
            ],
          );
        }

        if (Array.isArray(oppsRes)) {
          setOpportunities(oppsRes as Opportunity[]);
        }
      } catch (err) {
        console.error("Failed to fetch lender data", err);
      }
    };
    fetchData();
  }, []);

  const handleFund = async (opp: Opportunity) => {
    const amount = fundAmounts[opp.applicationId] ?? Math.round(opp.requestedAmount);
    if (!amount || amount <= 0) return;
    try {
      setFundingId(opp.applicationId);
      await fundOpportunity(opp.applicationId, amount);
      setFunded((prev) => new Set(prev).add(opp.applicationId));
    } catch (err) {
      console.error("Failed to fund opportunity", err);
    } finally {
      setFundingId(null);
    }
  };

  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleReject = async (opp: Opportunity) => {
    try {
      setRejectingId(opp.applicationId);
      await rejectOpportunity(opp.applicationId);
      setRejectedIds((prev) => new Set(prev).add(opp.applicationId));
    } catch (err) {
      console.error("Failed to reject opportunity", err);
    } finally {
      setRejectingId(null);
    }
  };

  const toggleFactors = (id: string) => {
    setExpandedFactors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
    {
      key: "remaining",
      header: "Remaining",
      numeric: true,
      hideBelow: "md",
      render: (r) => formatTaka(r.remainingAmount),
    },
    {
      key: "nextDue",
      header: "Next due",
      hideBelow: "lg",
      render: (r) => (r.nextDueDate ? formatDate(r.nextDueDate) : "—"),
    },
    { key: "status", header: "Status", render: (r) => <LoanStatusBadge status={r.status} /> },
  ];
  const maxDeployed =
    monthlyPerformance.length > 0 ? Math.max(...monthlyPerformance.map((m) => m.deployed)) : 1;
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
          description="Track your deployed capital, funded loans, and review new applications to fund."
        />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            label="Total deployed"
            value={formatTaka(statsState.totalDeployed)}
            hint={`Across ${fundedLoans.length} loan${fundedLoans.length === 1 ? "" : "s"}`}
          />
          <StatCard
            label="Active loans"
            value={String(statsState.activeLoans)}
            hint="In repayment"
          />
          <StatCard
            label="Average yield"
            value={formatPercent(statsState.averageYield)}
            tone="positive"
          />
          <StatCard
            label="Repayment rate"
            value={`${statsState.repaymentRate}%`}
            tone="positive"
            hint="Last 12 months"
          />
          <StatCard
            label="At-risk exposure"
            value={formatTaka(statsState.atRiskExposure)}
            tone="critical"
            hint="Overdue loans"
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
          {fundedLoans.length === 0 ? (
            <p className="px-5 py-8 text-sm text-stone-500">
              No funded loans yet. Fund an opportunity below to get started.
            </p>
          ) : (
            <DataTable
              caption="Funded loans"
              columns={columns}
              rows={fundedLoans}
              rowKey={(r) => r.id}
            />
          )}
        </div>

        <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-navy">Funding opportunities</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Real borrower applications matched to your preferred categories.
              </p>
            </div>
            <span className="text-xs text-stone-500">{opportunities.length} available</span>
          </div>
          {opportunities.length === 0 ? (
            <p className="text-sm text-stone-500">
              No new opportunities match your preferences right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {opportunities
                .filter((op) => !rejectedIds.has(op.applicationId))
                .map((op) => {
                  const isFunded = funded.has(op.applicationId);
                  const remaining = Math.max(0, op.requestedAmount - (op.committedAmount ?? 0));
                  const bandMeta = op.trustBand ? trustBandDisplay[op.trustBand] : null;
                  const showFactors = expandedFactors.has(op.applicationId);
                  return (
                    <div
                      key={op.applicationId}
                      className="border-[1.5px] border-stone-200 rounded-[6px] p-4 flex flex-col gap-3 min-w-0"
                    >
                      <div className="flex items-start justify-between gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-navy truncate">
                            {op.borrowerName ?? "Borrower"} · {op.purpose ?? "loan"}
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5 truncate">
                            {op.productName ?? "Loan product"}
                            {op.partnerName ? ` · ${op.partnerName}` : ""}
                          </p>
                          {op.purposeDescription && (
                            <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                              {op.purposeDescription}
                            </p>
                          )}
                        </div>
                        {bandMeta && (
                          <Badge variant={bandMeta.tone} size="sm" dot>
                            {bandMeta.label}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-stone-400">Requested</p>
                          <p className="tabular-nums font-medium text-navy">
                            {formatTaka(op.requestedAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-400">Remaining</p>
                          <p className="tabular-nums font-medium text-navy">
                            {formatTaka(remaining)}
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-400">Rate · Tenure</p>
                          <p className="tabular-nums font-medium text-navy">
                            {op.interestRate != null ? formatPercent(op.interestRate) : "—"}
                            {op.durationMonths ? ` · ${op.durationMonths} mo` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="bg-stone-50 rounded-[4px] p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500">Trust score</span>
                          <span className="tabular-nums font-semibold text-navy">
                            {op.trustScore != null ? `${Math.round(op.trustScore)} / 100` : "—"}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-600">
                          <span>Identity: {op.identityVerified ? "Verified" : "Pending"}</span>
                          <span>Address: {op.addressVerified ? "Verified" : "Pending"}</span>
                          <span>Income: {op.incomeVerified ? "Verified" : "Pending"}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleFactors(op.applicationId)}
                          className="mt-2 text-[11px] font-medium text-teal hover:underline"
                        >
                          {showFactors ? "Hide" : "Show"} trust-factor breakdown
                        </button>
                        {showFactors && op.trustFactors.length > 0 && (
                          <ul className="mt-2 space-y-1 text-[11px] text-stone-600">
                            {op.trustFactors.map((f) => (
                              <li
                                key={`${op.applicationId}-${f.name}`}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="truncate">{f.name}</span>
                                <span className="tabular-nums text-stone-500">
                                  {Math.round(f.score)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {!isFunded && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 mt-auto pt-2 border-t border-stone-100">
                          <div className="flex-1 min-w-0">
                            <CurrencyInput
                              label="Fund amount"
                              value={fundAmounts[op.applicationId] ?? Math.round(remaining)}
                              min={1}
                              max={remaining}
                              onChange={(e) =>
                                setFundAmounts((prev) => ({
                                  ...prev,
                                  [op.applicationId]: Number(e.target.value),
                                }))
                              }
                              hint={`Up to ${formatTaka(remaining)}`}
                            />
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={rejectingId === op.applicationId}
                            onClick={() => handleReject(op)}
                            disabled={fundingId !== null || rejectingId !== null}
                          >
                            Not now
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            loading={fundingId === op.applicationId}
                            onClick={() => handleFund(op)}
                            disabled={fundingId !== null || rejectingId !== null}
                          >
                            Fund
                          </Button>
                        </div>
                      )}
                      {isFunded && (
                        <p className="text-xs text-emerald font-medium pt-2 border-t border-stone-100">
                          Funding commitment recorded.
                        </p>
                      )}
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
