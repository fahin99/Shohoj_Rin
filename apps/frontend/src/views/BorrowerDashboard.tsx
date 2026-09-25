"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { Button } from "../components/Button";
import { Badge, LoanStatusBadge, AppStatusBadge } from "../components/Badge";
import { ProgressBar } from "../components/Progress";
import { StatCard } from "../components/StatCard";
import { Card, CardBody, CardHeader } from "../components/Card";
import { EmptyState, EmptyIcons } from "../components/EmptyState";
import { loansApi, applicationsApi } from "../lib/api/index";
import { formatDate, formatPercent, formatTaka } from "../lib/format";
import type { ApplicationRecord } from "../lib/api/applications";
import type { PageName, ActiveLoan, Transaction } from "../types";
import { getDisplayName, type StoredUserProfile } from "../lib/session";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";

interface BorrowerDashboardProps {
  onNavigate: (page: PageName) => void;
  user: StoredUserProfile;
}

const txDirection: Record<Transaction["type"], "in" | "out"> = {
  repayment: "out",
  payment: "out",
  fee: "out",
  disbursement: "in",
  refund: "in",
};

function TransactionIcon({ type }: { type: Transaction["type"] }) {
  const icons: Record<Transaction["type"], { bg: string; icon: string }> = {
    repayment: { bg: "bg-emerald-light", icon: "↑" },
    disbursement: { bg: "bg-teal-light", icon: "↓" },
    fee: { bg: "bg-coral-light", icon: "−" },
    payment: { bg: "bg-sky-light", icon: "↑" },
    refund: { bg: "bg-emerald-light", icon: "↩" },
  };
  const cfg = icons[type];
  return (
    <span
      aria-hidden="true"
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-stone-600 ${cfg.bg}`}
    >
      {cfg.icon}
    </span>
  );
}

export default function BorrowerDashboard({ onNavigate, user }: BorrowerDashboardProps) {
  const { t } = useTranslation();
  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const quickActions: { label: string; page: PageName; icon: string }[] = [
    { label: t("dashboard.exploreLoans"), icon: "🔍", page: "loan-marketplace" },
    { label: t("dashboard.makeAPayment"), icon: "💳", page: "repayment" },
    { label: t("dashboard.loanDetailsAction"), icon: "📋", page: "active-loan" },
    { label: t("dashboard.learnFinance"), icon: "📚", page: "education" },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [loansRes, appsRes] = await Promise.all([
          loansApi.getActiveLoans(true),
          applicationsApi.getApplications(),
        ]);

        const loan = loansRes[0] || null;
        setActiveLoan(loan);
        // API returns applicationId/productName/requestedAmount/submittedAt;
        // normalize to the id/product/amount/submitted shape used below.
        setApplications(
          (appsRes.applications || []).map((a) => ({
            ...a,
            id: a.applicationId ?? a.id,
            product: a.productName || a.purpose || a.product || t("application.loanProduct"),
            amount: a.requestedAmount ?? a.amount ?? 0,
            submitted: a.submittedAt || a.createdAt || a.submitted || "",
          })),
        );

        if (loan) {
          const txs = await loansApi.getLoanTransactions(loan.id);
          setTransactions(txs || []);
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [t]);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12
      ? t("dashboard.greetingMorning")
      : hour < 17
        ? t("dashboard.greetingAfternoon")
        : t("dashboard.greetingEvening");
  const openApplications = applications.filter(
    (a) =>
      a.status === "under-review" ||
      a.status === "under_review" ||
      a.status === "info-required" ||
      a.status === "info_required" ||
      a.status === "submitted" ||
      a.status === "approved",
  );
  const userName = getDisplayName(user, user?.profile?.fullName || "User");
  const firstName = userName.split(" ")[0] ?? userName;

  if (isLoading) {
    return (
      <AppLayout
        onNavigate={onNavigate}
        currentPage="borrower-dashboard"
        userType="borrower"
        userName={userName}
      >
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 flex justify-center items-center h-64">
          <p className="text-stone-500">{t("common.loading")}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      onNavigate={onNavigate}
      currentPage="borrower-dashboard"
      userType="borrower"
      userName={userName}
    >
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <header className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-navy">
              {greeting}, {firstName}
            </h1>
            <p className="mt-0.5 text-sm text-stone-500">
              {now.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => onNavigate("loan-marketplace")}>
            {t("dashboard.applyForLoan")}
          </Button>
        </header>
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label={t("dashboard.remainingBalance")}
            value={formatTaka(activeLoan ? activeLoan.remainingBalance : 0)}
            hint={activeLoan ? activeLoan.name : t("dashboard.noActiveLoans")}
          />
          <StatCard
            label={t("dashboard.nextRepayment")}
            value={formatTaka(activeLoan ? activeLoan.monthlyPayment : 0)}
            hint={
              activeLoan && activeLoan.nextPaymentDate
                ? `${t("dashboard.dueOn")} ${formatDate(activeLoan.nextPaymentDate)}`
                : t("dashboard.noPaymentsDue")
            }
            tone={activeLoan ? "attention" : undefined}
          />
          <StatCard
            label={t("dashboard.totalRepaid")}
            value={formatTaka(activeLoan ? activeLoan.amountRepaid : 0)}
            hint={
              activeLoan
                ? `${activeLoan.paidMonths} ${t("pagination.of")} ${activeLoan.durationMonths} ${t("dashboard.instalments")}`
                : `0 ${t("dashboard.instalments")}`
            }
            tone={activeLoan ? "positive" : undefined}
          />
          <StatCard
            label={t("dashboard.applications")}
            value={String(applications.length)}
            hint={
              openApplications.length > 0
                ? `${openApplications.length} ${t("dashboard.awaitingDecision")}`
                : t("dashboard.noPendingApplications")
            }
            tone="info"
          />
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
            {activeLoan ? (
              <section className="min-w-0 rounded-[8px] border-[1.5px] border-navy bg-white p-4 shadow-nb sm:p-5">
                <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                      {activeLoan.status === "pending_disbursement"
                        ? t("dashboard.approvedLoan")
                        : t("dashboard.activeLoan")}
                    </p>
                    <h2 className="mt-0.5 text-base font-semibold leading-snug text-navy">
                      {activeLoan.name}
                    </h2>
                  </div>
                  <LoanStatusBadge status={activeLoan.status ?? "active"} />
                </div>
                {activeLoan.status === "pending_disbursement" ? (
                  <>
                    <div className="rounded-[6px] border border-emerald/30 bg-emerald-light p-4 mb-4">
                      <p className="text-sm font-semibold text-emerald-dark text-navy">
                        ✓ {t("dashboard.approvedLoanDescription")}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        {t("dashboard.awaitingDisbursement")}
                      </p>
                    </div>
                    <dl className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="min-w-0">
                        <dt className="text-xs text-stone-500">{t("dashboard.amountBorrowed")}</dt>
                        <dd className="mt-0.5 tabular-nums font-semibold text-navy">
                          {formatTaka(activeLoan.principal)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-stone-500">{t("loanDetails.interestRate")}</dt>
                        <dd className="mt-0.5 tabular-nums font-semibold text-navy">
                          {formatPercent(activeLoan.interestRate)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-stone-500">
                          {t("loanDetails.repaymentDuration")}
                        </dt>
                        <dd className="mt-0.5 tabular-nums font-semibold text-navy">
                          {activeLoan.durationMonths} {t("loanDetails.monthsUnit")}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-4 flex flex-wrap items-center justify-end gap-3 border-t border-stone-100 pt-4">
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => onNavigate("active-loan")}
                      >
                        {t("dashboard.viewLoanDetails")}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <dl className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="min-w-0">
                        <dt className="text-xs text-stone-500">{t("dashboard.amountBorrowed")}</dt>
                        <dd className="mt-0.5 tabular-nums font-semibold text-navy">
                          {formatTaka(activeLoan.principal)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-stone-500">
                          {t("dashboard.remainingBalance")}
                        </dt>
                        <dd className="mt-0.5 tabular-nums font-semibold text-navy">
                          {formatTaka(activeLoan.remainingBalance)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-xs text-stone-500">{t("loanDetails.interestRate")}</dt>
                        <dd className="mt-0.5 tabular-nums font-semibold text-navy">
                          {formatPercent(activeLoan.interestRate)}
                        </dd>
                      </div>
                    </dl>
                    <ProgressBar
                      value={activeLoan.paidMonths}
                      max={activeLoan.durationMonths}
                      label={`${t("activeLoan.repaymentProgress")} — ${activeLoan.paidMonths} ${t("pagination.of")} ${activeLoan.durationMonths} ${t("loanDetails.monthsUnit")}`}
                      showValue
                      size="lg"
                      color="teal"
                    />
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                      <p className="min-w-0 text-xs text-stone-500">
                        {t("activeLoan.nextPayment")} {formatDate(activeLoan.nextPaymentDate)} —{" "}
                        <span className="tabular-nums font-medium text-navy">
                          {formatTaka(activeLoan.monthlyPayment)}
                        </span>
                      </p>
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => onNavigate("active-loan")}
                      >
                        {t("dashboard.viewLoanDetails")}
                      </Button>
                    </div>
                  </>
                )}
              </section>
            ) : (
              <div className="min-w-0 rounded-[8px] border-[1.5px] border-stone-200 bg-white shadow-nb">
                <EmptyState
                  icon={EmptyIcons.loans}
                  title={t("dashboard.emptyLoanTitle")}
                  description={t("dashboard.emptyLoanDescription")}
                  action={{
                    label: t("dashboard.exploreLoans"),
                    onClick: () => onNavigate("loan-marketplace"),
                  }}
                  secondaryAction={{
                    label: t("dashboard.learnMore"),
                    onClick: () => onNavigate("education"),
                  }}
                />
              </div>
            )}
            <Card>
              <CardHeader
                title={t("dashboard.recentTransactions")}
                action={
                  transactions.length > 0 ? (
                    <Button variant="ghost" size="sm" onClick={() => onNavigate("active-loan")}>
                      {t("common.seeAll")}
                    </Button>
                  ) : undefined
                }
              />
              {transactions.length > 0 ? (
                <ul className="divide-y divide-stone-100">
                  {transactions.slice(0, 5).map((tx) => {
                    const out = txDirection[tx.type] === "out";
                    return (
                      <li key={tx.id} className="flex min-w-0 items-center gap-3 px-4 py-3 sm:px-5">
                        <TransactionIcon type={tx.type} />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium leading-snug text-navy">
                            {tx.description}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500">{formatDate(tx.date)}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span
                            className={`tabular-nums text-sm font-semibold ${out ? "text-navy" : "text-emerald"}`}
                          >
                            {out ? "−" : "+"}
                            {formatTaka(Math.abs(tx.amount))}
                          </span>
                          <Badge
                            variant={
                              tx.status === "completed"
                                ? "success"
                                : tx.status === "failed"
                                  ? "error"
                                  : "warning"
                            }
                            size="sm"
                          >
                            {tx.status === "completed"
                              ? t("dashboard.txCompleted")
                              : tx.status === "failed"
                                ? t("dashboard.txFailed")
                                : t("dashboard.txPending")}
                          </Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <CardBody>
                  <EmptyState
                    icon={EmptyIcons.transactions}
                    title={t("dashboard.emptyTransactionsTitle")}
                    description={t("dashboard.emptyTransactionsDescription")}
                    size="sm"
                  />
                </CardBody>
              )}
            </Card>
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <Card>
              <CardHeader title={t("dashboard.quickActions")} />
              <CardBody>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => onNavigate(action.page)}
                      className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-[6px] border border-stone-200 p-3 text-center text-xs font-medium text-stone-600 transition-all hover:border-navy hover:text-navy hover:shadow-nb-xs"
                    >
                      <span aria-hidden="true" className="text-xl">
                        {action.icon}
                      </span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader
                title={t("dashboard.applications")}
                action={
                  applications.length > 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate("application-status")}
                    >
                      {t("common.viewAll")}
                    </Button>
                  ) : undefined
                }
              />
              <CardBody className="flex flex-col gap-2">
                {applications.length > 0 ? (
                  applications.slice(0, 3).map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => onNavigate("application-status")}
                      className="w-full rounded-[6px] border border-stone-200 p-3 text-left transition-colors hover:border-stone-300 hover:bg-stone-50"
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium leading-snug text-navy">
                            {app.product}
                          </p>
                        </div>
                        <AppStatusBadge status={app.status ?? "submitted"} />
                      </div>
                      <p className="mt-1.5 text-xs text-stone-500">
                        {formatTaka(app.amount || 0)} · {t("appStatusPage.submittedOn")}{" "}
                        {formatDate(app.submitted || "")}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="py-3 text-center text-xs text-stone-500">
                    {t("dashboard.noApplicationsYet")}
                  </p>
                )}
              </CardBody>
            </Card>
            {activeLoan && activeLoan.status !== "pending_disbursement" ? (
              <section className="rounded-[8px] border-[1.5px] border-yellow bg-yellow-light p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-yellow-dark">
                  {t("dashboard.upcomingPayment")}
                </p>
                <p className="font-display tabular-nums text-2xl font-semibold text-navy">
                  {formatTaka(activeLoan.monthlyPayment)}
                </p>
                <p className="mt-0.5 text-xs text-stone-600">
                  {t("dashboard.dueOn")} {formatDate(activeLoan.nextPaymentDate)}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="mt-3"
                  onClick={() => onNavigate("repayment")}
                >
                  {t("dashboard.payNow")}
                </Button>
              </section>
            ) : activeLoan && activeLoan.status === "pending_disbursement" ? (
              <section className="rounded-[8px] border-[1.5px] border-emerald/30 bg-emerald-light p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-dark">
                  {t("dashboard.approvedLoan")}
                </p>
                <p className="font-display text-base font-semibold text-navy">
                  {t("dashboard.awaitingDisbursement")}
                </p>
              </section>
            ) : (
              <section className="rounded-[8px] border-[1.5px] border-teal/30 bg-teal-light p-4">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal">
                  {t("dashboard.lookingForFinancing")}
                </p>
                <p className="font-display text-base font-semibold text-navy">
                  {t("dashboard.compareLoanOptions")}
                </p>
                <p className="mt-0.5 text-xs text-stone-600">
                  {t("dashboard.compareLoanOptionsBody")}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="mt-3"
                  onClick={() => onNavigate("loan-marketplace")}
                >
                  {t("dashboard.exploreLoans")}
                </Button>
              </section>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
