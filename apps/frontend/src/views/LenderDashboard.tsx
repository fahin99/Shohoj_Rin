"use client";

import { useCallback, useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { Alert } from "../components/Alert";
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
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";

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

const factorNameLabel: Record<string, string> = {
  repayment_history: "Repayment History",
  financial_capacity: "Financial Capacity",
  financial_behavior: "Financial Behavior",
  identity_verification: "Identity & Verification",
  credit_behavior: "Credit Behavior",
};

const roundTaka = (value: number): number => Math.round(value * 100) / 100;

function remainingFor(opp: Opportunity): number {
  const requested = Number(opp.requestedAmount) || 0;
  const committed = Number(opp.committedAmount) || 0;
  return Math.max(0, roundTaka(requested - committed));
}

export default function LenderDashboard({ onNavigate, user }: Props) {
  const { t } = useTranslation();
  const [funded, setFunded] = useState<Set<string>>(new Set());
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [fundedLoans, setFundedLoans] = useState<FundedLoan[]>([]);
  const [expandedFactors, setExpandedFactors] = useState<Set<string>>(new Set());
  const [fundAmounts, setFundAmounts] = useState<Record<string, string>>({});
  const [fundError, setFundError] = useState<string | null>(null);
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

  const loadData = useCallback(async () => {
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
            { label: t("trustBand.low_risk"), value: 58, color: "emerald" as const },
            { label: t("trustBand.moderate_risk"), value: 32, color: "yellow" as const },
            { label: t("trustBand.high_risk"), value: 10, color: "coral" as const },
          ],
        );
      }

      if (Array.isArray(oppsRes)) {
        setOpportunities(oppsRes as Opportunity[]);
      }
    } catch (err) {
      console.error("Failed to fetch lender data", err);
    }
  }, [t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleFund = async (opp: Opportunity) => {
    const remaining = remainingFor(opp);
    const entered = fundAmounts[opp.applicationId];
    const amount = entered && entered.trim() !== "" ? roundTaka(Number(entered)) : remaining;

    if (!Number.isFinite(amount) || amount <= 0) {
      setFundError(t("application.errorAmountMin", { amount: formatTaka(1) }));
      return;
    }
    if (amount > remaining) {
      setFundError(`Only ${formatTaka(remaining)} remains available for this application.`);
      return;
    }

    try {
      setFundingId(opp.applicationId);
      setFundError(null);
      await fundOpportunity(opp.applicationId, amount);
      setFunded((prev) => new Set(prev).add(opp.applicationId));
      setFundAmounts((prev) => {
        const next = { ...prev };
        delete next[opp.applicationId];
        return next;
      });
      await loadData();
    } catch (err) {
      console.error("Failed to fund opportunity", err);
      setFundError(t("common.requestFailed"));
      await loadData();
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
      header: t("application.loanProduct"),
      hideBelow: "md",
      render: (r) => <span className="text-stone-500">{r.product}</span>,
    },
    {
      key: "amount",
      header: t("loanDetails.loanAmount"),
      numeric: true,
      render: (r) => formatTaka(r.amount),
    },
    {
      key: "rate",
      header: t("loanDetails.interestRate"),
      numeric: true,
      hideBelow: "sm",
      render: (r) => formatPercent(r.rate),
    },
    {
      key: "tenure",
      header: t("loanDetails.tenure"),
      numeric: true,
      hideBelow: "lg",
      render: (r) => t("loanDetails.monthsUnit", { months: r.tenure }),
    },
    {
      key: "repaid",
      header: t("activeLoan.repaid"),
      numeric: true,
      render: (r) => `${r.repaidPct}%`,
    },
    {
      key: "remaining",
      header: t("lender.remaining"),
      numeric: true,
      hideBelow: "md",
      render: (r) => formatTaka(r.remainingAmount),
    },
    {
      key: "nextDue",
      header: t("activeLoan.nextPayment"),
      hideBelow: "lg",
      render: (r) => (r.nextDueDate ? formatDate(r.nextDueDate) : "—"),
    },
    {
      key: "status",
      header: t("settings.status"),
      render: (r) => <LoanStatusBadge status={r.status} />,
    },
  ];
  const maxDeployed =
    monthlyPerformance.length > 0 ? Math.max(...monthlyPerformance.map((m) => m.deployed)) : 1;
  const visibleOpportunities = opportunities.filter(
    (op) => !rejectedIds.has(op.applicationId) && remainingFor(op) > 0,
  );
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
          title={t("lender.welcomeBack", { name: firstName })}
          description={t("lender.subtitle")}
        />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            label={t("lender.totalDeployed")}
            value={formatTaka(statsState.totalDeployed)}
            hint={t("lender.acrossLoans", { count: fundedLoans.length })}
          />
          <StatCard
            label={t("lender.activeLoans")}
            value={String(statsState.activeLoans)}
            hint={t("lender.inRepayment")}
          />
          <StatCard
            label={t("lender.averageYield")}
            value={formatPercent(statsState.averageYield)}
            tone="positive"
          />
          <StatCard
            label={t("lender.repaymentRate")}
            value={`${statsState.repaymentRate}%`}
            tone="positive"
            hint={t("lender.last12Months")}
          />
          <StatCard
            label={t("lender.atRiskExposure")}
            value={formatTaka(statsState.atRiskExposure)}
            tone="critical"
            hint={t("lender.overdueLoans")}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <div className="lg:col-span-2 bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5 min-w-0">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between items-start mb-5">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-navy">{t("lender.capitalDeployed")}</h2>
                <p className="text-xs text-stone-500 mt-0.5">{t("lender.monthlyDisbursed")}</p>
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
            <h2 className="text-sm font-semibold text-navy mb-4">{t("lender.riskDistribution")}</h2>
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
            <h2 className="text-sm font-semibold text-navy min-w-0">{t("lender.fundedLoans")}</h2>
            <span className="text-xs text-stone-500 shrink-0">
              {fundedLoans.length} {t("common.loans", "loans")}
            </span>
          </div>
          {fundedLoans.length === 0 ? (
            <p className="px-5 py-8 text-sm text-stone-500">{t("lender.noFundedLoans")}</p>
          ) : (
            <DataTable
              caption={t("lender.fundedLoans")}
              columns={columns}
              rows={fundedLoans}
              rowKey={(r) => r.id}
            />
          )}
        </div>

        <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-navy">
                {t("lender.fundingOpportunities")}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {t("lender.fundingOpportunitiesHint")}
              </p>
            </div>
            <span className="text-xs text-stone-500">
              {t("lender.available", { count: visibleOpportunities.length })}
            </span>
          </div>
          {fundError && (
            <Alert variant="error" title={t("lender.fundingNotRecorded")} className="mb-5">
              {fundError}
            </Alert>
          )}
          {visibleOpportunities.length === 0 ? (
            <p className="text-sm text-stone-500">{t("lender.noMatchingOpportunities")}</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {opportunities
                .filter((op) => !rejectedIds.has(op.applicationId) && remainingFor(op) > 0)
                .map((op) => {
                  const isFunded = funded.has(op.applicationId);
                  const remaining = remainingFor(op);
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
                            {op.borrowerName ?? "Borrower"} ·{" "}
                            {op.purpose ?? t("application.purpose")}
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5 truncate">
                            {op.productName ?? t("application.loanProduct")}
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
                            {op.trustBand ? t(enumKey("trustBand", op.trustBand)) : bandMeta.label}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-stone-400">{t("lender.requested")}</p>
                          <p className="tabular-nums font-medium text-navy">
                            {formatTaka(op.requestedAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-400">{t("lender.remaining")}</p>
                          <p className="tabular-nums font-medium text-navy">
                            {formatTaka(remaining)}
                          </p>
                        </div>
                        <div>
                          <p className="text-stone-400">{t("lender.rateAndTenure")}</p>
                          <p className="tabular-nums font-medium text-navy">
                            {op.interestRate != null ? formatPercent(op.interestRate) : "—"}
                            {op.durationMonths
                              ? ` · ${t("loanDetails.monthsUnit", { months: op.durationMonths })}`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <div className="bg-stone-50 rounded-[4px] p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500">{t("lender.trustScore")}</span>
                          <span className="tabular-nums font-semibold text-navy">
                            {op.trustScore != null ? `${Math.round(op.trustScore)} / 100` : "—"}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-stone-600">
                          <span>
                            {t("lender.identity")}:{" "}
                            {op.identityVerified
                              ? t("verification.approved")
                              : t("verification.pending")}
                          </span>
                          <span>
                            {t("lender.address")}:{" "}
                            {op.addressVerified
                              ? t("verification.approved")
                              : t("verification.pending")}
                          </span>
                          <span>
                            {t("lender.income")}:{" "}
                            {op.incomeVerified
                              ? t("verification.approved")
                              : t("verification.pending")}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleFactors(op.applicationId)}
                          className="mt-2 text-[11px] font-medium text-teal hover:underline"
                        >
                          {showFactors ? t("lender.hideBreakdown") : t("lender.showBreakdown")}
                        </button>
                        {showFactors && op.trustFactors.length > 0 && (
                          <ul className="mt-2 space-y-1 text-[11px] text-stone-600">
                            {op.trustFactors.map((f) => (
                              <li
                                key={`${op.applicationId}-${f.name}`}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="truncate">
                                  {factorNameLabel[f.name] ?? f.name}
                                </span>
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
                              label={t("lender.fundAmount")}
                              value={fundAmounts[op.applicationId] ?? String(remaining)}
                              min={1}
                              max={remaining}
                              onChange={(e) =>
                                setFundAmounts((prev) => ({
                                  ...prev,
                                  [op.applicationId]: e.target.value,
                                }))
                              }
                              hint={t("lender.upTo", { amount: formatTaka(remaining) })}
                            />
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={rejectingId === op.applicationId}
                            onClick={() => handleReject(op)}
                            disabled={fundingId !== null || rejectingId !== null}
                          >
                            {t("lender.notNow")}
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            loading={fundingId === op.applicationId}
                            onClick={() => handleFund(op)}
                            disabled={fundingId !== null || rejectingId !== null}
                          >
                            {t("lender.fund")}
                          </Button>
                        </div>
                      )}
                      {isFunded && (
                        <p className="text-xs text-emerald font-medium pt-2 border-t border-stone-100">
                          {t("lender.fundingRecorded")}
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
