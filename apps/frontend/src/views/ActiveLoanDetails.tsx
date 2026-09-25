"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { Card, CardHeader, CardBody, DataRow } from "../components/Card";
import { StatCard } from "../components/StatCard";
import { Badge, LoanStatusBadge } from "../components/Badge";
import { Tabs, TabPanel } from "../components/Tabs";
import { ProgressBar } from "../components/Progress";
import { Button } from "../components/Button";
import { DataTable } from "../components/DataTable";
import { EmptyState, EmptyIcons } from "../components/EmptyState";
import { loansApi } from "../lib/api/index";
import { formatTaka, formatPercent, formatDate } from "../lib/format";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";
import type {
  ActiveLoan,
  PageName,
  RepaymentScheduleRow,
  Transaction,
  TransactionType,
} from "../types";

interface Props {
  onNavigate: (page: PageName) => void;
}

const scheduleStatusVariant: Record<
  RepaymentScheduleRow["status"],
  "success" | "warning" | "error" | "neutral"
> = {
  paid: "success",
  due: "warning",
  upcoming: "neutral",
  overdue: "error",
  partially_paid: "warning",
};

const txStatusVariant: Record<Transaction["status"], "success" | "warning" | "error"> = {
  completed: "success",
  pending: "warning",
  failed: "error",
};

export default function ActiveLoanDetails({ onNavigate }: Props) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"schedule" | "transactions">("schedule");
  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
  const [repaymentSchedule, setRepaymentSchedule] = useState<RepaymentScheduleRow[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const loansRes = await loansApi.getActiveLoans(true);
        const loan = loansRes[0] || null;
        setActiveLoan(loan);

        if (loan) {
          const [txs, sched] = await Promise.all([
            loansApi.getLoanTransactions(loan.id),
            loansApi.getRepaymentSchedule(loan.id),
          ]);
          setTransactions(txs || []);
          setRepaymentSchedule(sched || []);
        }
      } catch (e) {
        console.error("Failed to load loan details", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="active-loan">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 flex justify-center items-center h-64">
          <p className="text-stone-500">{t("common.loading")}</p>
        </div>
      </AppLayout>
    );
  }

  if (!activeLoan) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="active-loan">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
          <PageHeader
            eyebrow={t("activeLoan.eyebrow")}
            title={t("activeLoan.title")}
            description={t("activeLoan.description")}
          />
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px]">
            <EmptyState
              icon={EmptyIcons.loans}
              title={t("activeLoan.emptyTitle")}
              description={t("activeLoan.emptyDescription")}
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
        </div>
      </AppLayout>
    );
  }

  const remaining = activeLoan.durationMonths - activeLoan.paidMonths;
  return (
    <AppLayout onNavigate={onNavigate} currentPage="active-loan">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between sm:items-start mb-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-1">
              {activeLoan.status === "pending_disbursement"
                ? "Approved Loan"
                : t("activeLoan.eyebrow")}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-navy truncate">
              {activeLoan.name}
            </h1>
            <p className="text-sm text-stone-500 mt-1">{activeLoan.provider}</p>
          </div>
          <div className="shrink-0 flex items-start">
            <LoanStatusBadge status={activeLoan.status ?? "active"} />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label={t("activeLoan.principal")}
            value={formatTaka(activeLoan.principal)}
            hint={t("activeLoan.principalHint")}
          />
          <StatCard
            label={t("activeLoan.repaid")}
            value={formatTaka(activeLoan.amountRepaid)}
            tone="positive"
            hint={t("activeLoan.monthsPaid", {
              paid: activeLoan.paidMonths,
              total: activeLoan.durationMonths,
            })}
          />
          <StatCard
            label={t("activeLoan.remainingBalance")}
            value={formatTaka(activeLoan.remainingBalance)}
            tone="attention"
          />
          <StatCard
            label={t("activeLoan.nextPayment")}
            value={formatTaka(activeLoan.monthlyPayment)}
            tone="info"
            hint={t("dashboard.dueOn", { date: formatDate(activeLoan.nextPaymentDate) })}
          />
        </div>
        <Card variant="raised" className="p-5 mb-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between sm:items-center mb-4">
            <h2 className="text-base font-semibold text-navy">
              {t("activeLoan.repaymentProgress")}
            </h2>
            <p className="text-sm text-stone-500 shrink-0">
              {t("activeLoan.monthsPaid", {
                paid: activeLoan.paidMonths,
                total: activeLoan.durationMonths,
              })}
            </p>
          </div>
          <ProgressBar
            value={activeLoan.paidMonths}
            max={activeLoan.durationMonths}
            showValue
            size="lg"
            color="teal"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-stone-100">
            <p className="text-sm text-stone-500">
              {t("activeLoan.nextDueDate", {
                date: formatDate(activeLoan.nextPaymentDate),
                remaining,
              })}
            </p>
            {activeLoan.status === "pending_disbursement" ? (
              <p className="text-sm font-medium text-stone-500">Available after disbursement</p>
            ) : (
              <Button variant="primary" size="sm" onClick={() => onNavigate("repayment")}>
                {t("activeLoan.payNowAction")}
              </Button>
            )}
          </div>
        </Card>
        <Card variant="plain" className="mb-6">
          <CardHeader
            title={t("activeLoan.costBreakdown")}
            description={t("activeLoan.costBreakdownHint")}
          />
          <CardBody>
            <DataRow label={t("activeLoan.principal")} value={formatTaka(activeLoan.principal)} />
            <DataRow
              label={t("loanDetails.interestRate")}
              value={formatPercent(activeLoan.interestRate)}
            />
            <DataRow
              label={t("activeLoan.interestPaid")}
              value={formatTaka(activeLoan.interestPaid)}
            />
            <DataRow label={t("activeLoan.feesPaid")} value={formatTaka(activeLoan.feesPaid)} />
            <DataRow
              label={t("activeLoan.totalRepayable")}
              value={formatTaka(activeLoan.totalRepayable)}
              emphasis
            />
            <DataRow
              label={t("activeLoan.totalPaidSoFar")}
              value={formatTaka(activeLoan.amountRepaid)}
            />
            <DataRow
              label={t("activeLoan.remainingBalance")}
              value={formatTaka(activeLoan.remainingBalance)}
              emphasis
            />
          </CardBody>
        </Card>
        <Card variant="plain" className="mb-6">
          <div className="px-4 sm:px-5 pt-4">
            <Tabs
              tabs={[
                {
                  id: "schedule",
                  label: t("activeLoan.repaymentSchedule"),
                  count: repaymentSchedule.length,
                },
                {
                  id: "transactions",
                  label: t("activeLoan.transactionHistory"),
                  count: transactions.length,
                },
              ]}
              activeTab={tab}
              onChange={(id) => setTab(id as typeof tab)}
            />
          </div>
          <TabPanel id="schedule" activeTab={tab}>
            <DataTable
              caption={t("activeLoan.repaymentSchedule")}
              rows={repaymentSchedule}
              rowKey={(r) =>
                String((r as RepaymentScheduleRow & { scheduleId: string }).scheduleId)
              }
              columns={[
                { key: "month", header: t("activeLoan.scheduleMonth"), render: (r) => r.month },
                {
                  key: "due",
                  header: t("activeLoan.scheduleDue"),
                  render: (r) => formatDate(r.dueDate),
                },
                {
                  key: "principal",
                  header: t("activeLoan.schedulePrincipal"),
                  numeric: true,
                  hideBelow: "sm",
                  render: (r) => formatTaka(r.principal),
                },
                {
                  key: "interest",
                  header: t("activeLoan.scheduleInterest"),
                  numeric: true,
                  hideBelow: "sm",
                  render: (r) => formatTaka(r.interest),
                },
                {
                  key: "total",
                  header: t("activeLoan.scheduleTotal"),
                  numeric: true,
                  render: (r) => formatTaka(r.total),
                },
                {
                  key: "paid",
                  header: t("activeLoan.schedulePaid"),
                  numeric: true,
                  render: (r) => (
                    <span className={r.paidAmount > 0 ? "text-emerald" : ""}>
                      {formatTaka(r.paidAmount)}
                    </span>
                  ),
                },
                {
                  key: "outstanding",
                  header: t("activeLoan.scheduleOutstanding"),
                  numeric: true,
                  render: (r) => (
                    <span className={r.outstandingAmount > 0 ? "text-coral font-medium" : ""}>
                      {formatTaka(r.outstandingAmount)}
                    </span>
                  ),
                },
                {
                  key: "status",
                  header: t("activeLoan.scheduleStatus"),
                  render: (r) => (
                    <div className="flex items-center gap-2 justify-end">
                      <Badge
                        variant={scheduleStatusVariant[r.status as RepaymentScheduleRow["status"]]}
                        size="sm"
                        dot
                      >
                        {t(enumKey("activeLoan.status", r.status))}
                      </Badge>
                      {r.outstandingAmount > 0 && (
                        <Button
                          variant="tertiary"
                          size="xs"
                          onClick={() => onNavigate("repayment")}
                        >
                          {t("activeLoan.payNowAction")}
                        </Button>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </TabPanel>
          <TabPanel id="transactions" activeTab={tab}>
            <DataTable
              caption={t("activeLoan.transactionHistory")}
              rows={transactions}
              rowKey={(t) => t.id}
              columns={[
                { key: "date", header: t("common.date"), render: (tx) => formatDate(tx.date) },
                {
                  key: "desc",
                  header: t("common.description"),
                  render: (tx) => (
                    <span className="block min-w-0 truncate max-w-[220px]">{tx.description}</span>
                  ),
                },
                {
                  key: "type",
                  header: t("common.type"),
                  hideBelow: "sm",
                  render: (tx) => (
                    <Badge variant="neutral" size="sm">
                      {t(enumKey("activeLoan.txType", tx.type))}
                    </Badge>
                  ),
                },
                {
                  key: "amount",
                  header: t("common.amount"),
                  numeric: true,
                  render: (tx) => (
                    <span
                      className={
                        tx.type === "disbursement" || tx.type === "refund"
                          ? "text-emerald"
                          : "text-coral"
                      }
                    >
                      {tx.type === "disbursement" || tx.type === "refund" ? "+" : "−"}
                      {formatTaka(Math.abs(tx.amount))}
                    </span>
                  ),
                },
                {
                  key: "status",
                  header: t("common.status"),
                  render: (tx) => (
                    <Badge variant={txStatusVariant[tx.status]} size="sm" dot>
                      {t(enumKey("dashboard.tx", tx.status))}
                    </Badge>
                  ),
                },
              ]}
            />
          </TabPanel>
        </Card>
        <Card variant="plain" className="p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between sm:items-center">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-navy">{t("activeLoan.agreement")}</h2>
              <p className="text-xs text-stone-500 mt-0.5">{t("activeLoan.agreementHint")}</p>
            </div>
            <Button variant="secondary" size="sm" className="shrink-0">
              {t("activeLoan.downloadPdf")}
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
