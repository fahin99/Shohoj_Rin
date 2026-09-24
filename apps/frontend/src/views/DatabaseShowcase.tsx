"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "../components/Alert";
import { AppLayout } from "../components/AppLayout";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { DataTable, type Column } from "../components/DataTable";
import { EmptyIcons, EmptyState } from "../components/EmptyState";
import { PageHeader } from "../components/PageHeader";
import { Skeleton, SkeletonDashboard } from "../components/Skeleton";
import { StatCard } from "../components/StatCard";
import {
  getDatabaseOverview,
  getDatabaseShowcaseQueries,
  getDatabaseTriggers,
  getLoanBalanceShowcase,
  type DatabaseOverview,
  type DatabaseShowcaseQueries,
  type DatabaseTrigger,
  type LoanBalanceRow,
} from "../lib/api/admin";
import { formatTaka } from "../lib/format";
import { getDisplayName, type StoredUserProfile } from "../lib/session";
import type { PageName } from "../types";

type ShowcaseData = {
  overview: DatabaseOverview;
  queries: DatabaseShowcaseQueries;
  loanBalances: LoanBalanceRow[];
  loanBalanceTotal: number;
  triggers: DatabaseTrigger[];
};

const triggerPurpose: Record<string, string> = {
  trg_users_updated_at: "Maintains users.updated_at automatically on updates.",
  trg_audit_logs_append_only: "Rejects updates and deletes so audit history remains append-only.",
  trg_trust_scores_restrict_update:
    "Only permits changing the current-score marker; score history is protected.",
  trg_repayments_append_only: "Rejects changes to recorded repayment rows.",
  trg_users_ensure_lender_investor_profile:
    "Creates the required investor profile when a user becomes a lender.",
};

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-[8px] border-[1.5px] border-stone-200 bg-white">
      <div className="border-b border-stone-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-navy">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">{description}</p>
      </div>
      {children}
    </section>
  );
}

export default function DatabaseShowcase({
  onNavigate,
  user,
}: {
  onNavigate: (page: PageName) => void;
  user: StoredUserProfile;
}) {
  const [data, setData] = useState<ShowcaseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overview, queries, balancePage, triggers] = await Promise.all([
        getDatabaseOverview(),
        getDatabaseShowcaseQueries(),
        getLoanBalanceShowcase({ limit: 8 }),
        getDatabaseTriggers(),
      ]);
      setData({
        overview,
        queries,
        loanBalances: balancePage.loans,
        loanBalanceTotal: balancePage.total,
        triggers,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the database showcase.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const portfolioColumns: Column<DatabaseShowcaseQueries["loanPortfolio"][number]>[] = [
    {
      key: "status",
      header: "Loan status",
      render: (row) => (
        <Badge variant="neutral" size="sm">
          {row.loanStatus}
        </Badge>
      ),
    },
    { key: "loans", header: "Loans", numeric: true, render: (row) => row.loanCount },
    {
      key: "principal",
      header: "Principal",
      numeric: true,
      render: (row) => formatTaka(row.principalAmount),
    },
    {
      key: "scheduled",
      header: "Scheduled",
      numeric: true,
      hideBelow: "md",
      render: (row) => formatTaka(row.scheduledAmount),
    },
    { key: "paid", header: "Paid", numeric: true, render: (row) => formatTaka(row.paidAmount) },
  ];
  const lenderColumns: Column<DatabaseShowcaseQueries["lenderFunding"][number]>[] = [
    {
      key: "risk",
      header: "Risk preference",
      render: (row) => row.riskPreference.replaceAll("_", " "),
    },
    { key: "lenders", header: "Lenders", numeric: true, render: (row) => row.lenderCount },
    {
      key: "commitments",
      header: "Commitments",
      numeric: true,
      render: (row) => row.commitmentCount,
    },
    {
      key: "amount",
      header: "Committed",
      numeric: true,
      render: (row) => formatTaka(row.committedAmount),
    },
  ];
  const applicationColumns: Column<DatabaseShowcaseQueries["applicationTrust"][number]>[] = [
    {
      key: "status",
      header: "Application status",
      render: (row) => (
        <Badge variant="neutral" size="sm">
          {row.applicationStatus}
        </Badge>
      ),
    },
    {
      key: "applications",
      header: "Applications",
      numeric: true,
      render: (row) => row.applicationCount,
    },
    {
      key: "requested",
      header: "Requested",
      numeric: true,
      render: (row) => formatTaka(row.requestedAmount),
    },
    {
      key: "trust",
      header: "Average trust",
      numeric: true,
      hideBelow: "sm",
      render: (row) => row.averageTrustScore ?? "—",
    },
    {
      key: "committed",
      header: "Committed",
      numeric: true,
      render: (row) => formatTaka(row.committedAmount),
    },
  ];

  return (
    <AppLayout
      onNavigate={onNavigate}
      currentPage="database-showcase"
      userType="admin"
      userName={getDisplayName(user)}
    >
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        <PageHeader
          eyebrow="Admin-only database demonstration"
          title="Database Showcase"
          description="Read-only, live PostgreSQL results. Aggregate views intentionally exclude borrower identity and KYC information."
          actions={
            <Button variant="secondary" size="sm" onClick={() => void load()} loading={loading}>
              Refresh live data
            </Button>
          }
        />

        {error && (
          <Alert variant="error" title="Database data could not be loaded" className="mb-6">
            {error}{" "}
            <button type="button" className="font-semibold underline" onClick={() => void load()}>
              Try again
            </button>
          </Alert>
        )}

        {loading && !data ? (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-28" />
              ))}
            </div>
            <SkeletonDashboard />
          </div>
        ) : data ? (
          <>
            <Section
              title="Database overview"
              description="Current record counts fetched directly from PostgreSQL on each refresh."
            >
              <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-3">
                <StatCard label="Total users" value={data.overview.users} />
                <StatCard label="Borrowers" value={data.overview.borrowers} tone="info" />
                <StatCard
                  label="Lenders / investors"
                  value={data.overview.lenders}
                  hint={`${data.overview.lendersWithInvestorProfile} with investor profile`}
                  tone="positive"
                />
                <StatCard label="Loan applications" value={data.overview.loanApplications} />
                <StatCard label="Active loans" value={data.overview.activeLoans} tone="attention" />
                <StatCard label="Repayments" value={data.overview.repayments} />
              </div>
            </Section>

            <Section
              title="Complex SQL"
              description="Three aggregate PostgreSQL queries using joins, common table expressions, grouping, and conditional aggregation."
            >
              <div className="grid grid-cols-1 gap-4 p-5 xl:grid-cols-3">
                <div className="overflow-hidden rounded-[6px] border border-stone-200">
                  <div className="border-b border-stone-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-navy">Loan portfolio</h3>
                    <p className="mt-1 text-xs text-stone-500">
                      Scheduled and completed repayments grouped by loan status.
                    </p>
                  </div>
                  <DataTable
                    caption="Loan portfolio results"
                    columns={portfolioColumns}
                    rows={data.queries.loanPortfolio}
                    rowKey={(row) => row.loanStatus}
                    empty={
                      <EmptyState
                        size="sm"
                        icon={EmptyIcons.loans}
                        title="No loans yet"
                        description="Portfolio results will appear after loans are created."
                      />
                    }
                  />
                </div>
                <div className="overflow-hidden rounded-[6px] border border-stone-200">
                  <div className="border-b border-stone-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-navy">Lender funding</h3>
                    <p className="mt-1 text-xs text-stone-500">
                      Investor-profile preference and committed funding performance.
                    </p>
                  </div>
                  <DataTable
                    caption="Lender funding results"
                    columns={lenderColumns}
                    rows={data.queries.lenderFunding}
                    rowKey={(row) => row.riskPreference}
                    empty={
                      <EmptyState
                        size="sm"
                        icon={EmptyIcons.transactions}
                        title="No lenders yet"
                        description="Funding aggregates will appear after lender accounts exist."
                      />
                    }
                  />
                </div>
                <div className="overflow-hidden rounded-[6px] border border-stone-200">
                  <div className="border-b border-stone-200 px-4 py-3">
                    <h3 className="text-sm font-semibold text-navy">Applications and trust</h3>
                    <p className="mt-1 text-xs text-stone-500">
                      Application status, linked trust scores, and committed funding.
                    </p>
                  </div>
                  <DataTable
                    caption="Application and trust results"
                    columns={applicationColumns}
                    rows={data.queries.applicationTrust}
                    rowKey={(row) => row.applicationStatus}
                    empty={
                      <EmptyState
                        size="sm"
                        icon={EmptyIcons.search}
                        title="No applications yet"
                        description="Application aggregates will appear when applications are submitted."
                      />
                    }
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Database function"
              description="Remaining balance is computed inside PostgreSQL by calculate_loan_remaining_balance(loan_id), not in the browser."
            >
              <DataTable
                caption="PostgreSQL remaining balance function results"
                rows={data.loanBalances}
                rowKey={(row) => row.loanId}
                empty={
                  <EmptyState
                    icon={EmptyIcons.loans}
                    title="No loan balance to calculate"
                    description="Create a loan and repayment schedule to see a live PostgreSQL function result."
                  />
                }
                columns={[
                  {
                    key: "status",
                    header: "Loan status",
                    render: (row) => (
                      <Badge variant="neutral" size="sm">
                        {row.loanStatus}
                      </Badge>
                    ),
                  },
                  {
                    key: "principal",
                    header: "Principal",
                    numeric: true,
                    render: (row) => formatTaka(row.principalAmount),
                  },
                  {
                    key: "schedule",
                    header: "Installments paid",
                    numeric: true,
                    render: (row) => `${row.paidInstallmentCount} / ${row.installmentCount}`,
                  },
                  {
                    key: "balance",
                    header: "Remaining balance",
                    numeric: true,
                    render: (row) => formatTaka(row.remainingBalance),
                  },
                ]}
              />
              {data.loanBalanceTotal > data.loanBalances.length && (
                <p className="border-t border-stone-200 px-5 py-3 text-xs text-stone-500">
                  Showing the newest {data.loanBalances.length} of {data.loanBalanceTotal} loans.
                </p>
              )}
            </Section>

            <Section
              title="Triggers"
              description="Read-only PostgreSQL catalog metadata confirms that these safeguards are installed and enabled; no destructive trigger demonstration is run."
            >
              <div className="divide-y divide-stone-100">
                {data.triggers.map((trigger) => (
                  <div
                    key={trigger.triggerName}
                    className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-mono text-xs font-semibold text-navy">
                        {trigger.triggerName}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {triggerPurpose[trigger.triggerName] ?? "Database trigger metadata."}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        {trigger.tableName} · {trigger.event}
                      </Badge>
                      <Badge variant={trigger.enabled ? "success" : "warning"} size="sm" dot>
                        {trigger.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                ))}
                {data.triggers.length === 0 && (
                  <EmptyState
                    size="sm"
                    icon={EmptyIcons.transactions}
                    title="No selected triggers found"
                    description="Run the current schema migration before this demonstration."
                  />
                )}
              </div>
            </Section>

            <Section
              title="Transactions"
              description="This is an implementation explanation, not a simulated transaction status."
            >
              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                <div className="rounded-[6px] border border-stone-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                    Funding commitment workflow
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy">
                    POST /api/v1/investor/fund/:applicationId
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">
                    Locks the lender match and commitment, creates the commitment, and—when fully
                    funded—creates offer, loan, disbursement, repayment schedules, audit log, and
                    notification.
                  </p>
                </div>
                <div className="rounded-[6px] border border-stone-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                    Atomicity
                  </p>
                  <p className="mt-2 text-sm font-medium text-navy">
                    BEGIN → validation and writes → COMMIT
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">
                    Every validation, conflict, or database failure follows ROLLBACK, preventing a
                    partial loan lifecycle or orphaned funding record.
                  </p>
                </div>
              </div>
            </Section>
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}
