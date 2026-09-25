"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";
import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { Card, CardHeader, CardBody, DataRow } from "../components/Card";
import { Badge } from "../components/Badge";
import { Alert } from "../components/Alert";
import { CurrencyInput, Select } from "../components/Input";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { DataTable } from "../components/DataTable";
import { ProgressBar } from "../components/Progress";
import { EmptyState, EmptyIcons } from "../components/EmptyState";
import { loansApi, paymentAccountsApi } from "../lib/api/index";
import type { MvpRepaymentResult } from "../lib/api/loans";
import type { UserPaymentAccount } from "@shohojrin/shared";
import { maskAccountNumber, getProviderBadge } from "../components/PaymentAccountsManager";
import { formatTaka, formatDate } from "../lib/format";
import type { PageName, RepaymentScheduleRow, ActiveLoan } from "../types";

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

export default function RepaymentPage({ onNavigate }: Props) {
  const { t } = useTranslation();

  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
  const [schedules, setSchedules] = useState<RepaymentScheduleRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedSchedule, setSelectedSchedule] = useState<RepaymentScheduleRow | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [success, setSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{
    repaymentId: string;
    amountPaid: number;
    installmentNumber: number;
    loanCompleted: boolean;
    remainingAfter: number;
    trustScore: { score: number; band: string } | null;
  } | null>(null);
  const [paymentAccounts, setPaymentAccounts] = useState<UserPaymentAccount[]>([]);
  const [selectedPaymentAccountId, setSelectedPaymentAccountId] = useState<string>("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [loansRes, accounts] = await Promise.all([
        loansApi.getActiveLoans(),
        paymentAccountsApi.getPaymentAccounts(),
      ]);
      setLoans(loansRes);
      setPaymentAccounts(accounts);
      const defaultAccount = accounts.find((a) => a.isDefault);
      if (defaultAccount) setSelectedPaymentAccountId(defaultAccount.accountId);
      const loan = loansRes[0] || null;
      setActiveLoan(loan);

      if (loan) {
        const sched = await loansApi.getRepaymentSchedule(loan.id);
        setSchedules(sched);
      }
    } catch (e) {
      console.error("Failed to fetch repayment data", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const outstandingSchedules = schedules.filter((s) => s.outstandingAmount > 0);
  const totalOutstanding = schedules.reduce((sum, s) => sum + s.outstandingAmount, 0);
  const totalPaid = schedules.reduce((sum, s) => sum + s.paidAmount, 0);
  const totalExpected = schedules.reduce((sum, s) => sum + s.expectedAmount, 0);

  async function handleLoanChange(loanId: string) {
    const loan = loans.find((item) => item.id === loanId);
    if (!loan) return;
    setActiveLoan(loan);
    setSelectedSchedule(null);
    setPaymentAmount("");
    setErrorMessage(null);
    setSchedules(await loansApi.getRepaymentSchedule(loan.id));
  }

  const parsedAmount = Math.max(0, Number(paymentAmount) || 0);
  const maxPayable = selectedSchedule?.outstandingAmount ?? 0;
  const isAmountValid = parsedAmount > 0 && parsedAmount <= maxPayable;

  function handleSelectSchedule(schedule: RepaymentScheduleRow) {
    setSelectedSchedule(schedule);
    setPaymentAmount(String(schedule.outstandingAmount));
    setErrorMessage(null);
  }

  function handleOpenConfirm() {
    if (!isAmountValid) {
      setErrorMessage(t("repayment.amountExceedsOutstanding"));
      return;
    }
    setErrorMessage(null);
    setConfirmOpen(true);
  }

  async function handleSubmitPayment() {
    if (!selectedSchedule || !isAmountValid) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result: MvpRepaymentResult = await loansApi.createRepayment(
        selectedSchedule.scheduleId,
        parsedAmount,
        selectedPaymentAccountId ? { paymentAccountId: selectedPaymentAccountId } : undefined,
      );
      setSuccessData({
        repaymentId: result.repayment.repaymentId,
        amountPaid: result.repayment.amountPaid,
        installmentNumber: selectedSchedule.month,
        loanCompleted: result.loan.status === "completed",
        remainingAfter: result.loan.totalOutstanding,
        trustScore: result.trustScore,
      });
      setConfirmOpen(false);
      setSuccess(true);
    } catch (e) {
      setConfirmOpen(false);
      console.error("Failed to submit repayment", e);
      setErrorMessage(t("repayment.paymentFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Loading state ──
  if (isLoading) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="repayment">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10 flex justify-center items-center h-64">
          <p className="text-stone-500">{t("common.loading")}</p>
        </div>
      </AppLayout>
    );
  }

  // ── Success state ──
  if (success && successData) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="repayment">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
          <Card variant="raised" className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-light border-[1.5px] border-emerald flex items-center justify-center text-2xl text-emerald mx-auto mb-4">
              ✓
            </div>
            <h1 className="text-2xl font-semibold text-navy mb-1">
              {successData.loanCompleted
                ? t("repayment.successTitleCompleted")
                : t("repayment.successTitle")}
            </h1>
            <p className="text-sm text-stone-500 mb-6">
              {successData.loanCompleted
                ? t("repayment.successBodyCompleted")
                : t("repayment.successBody")}
            </p>
            <div className="text-left bg-stone-50 border border-stone-200 rounded-[8px] p-4">
              <DataRow label={t("repayment.receiptNo")} value={successData.repaymentId} />
              <DataRow
                label={t("repayment.instalment")}
                value={`#${successData.installmentNumber}`}
              />
              <DataRow
                label={t("repayment.paidAmount")}
                value={formatTaka(successData.amountPaid)}
                emphasis
              />
              <DataRow
                label={t("repayment.remainingAfter")}
                value={formatTaka(successData.remainingAfter)}
              />
              {successData.trustScore && (
                <DataRow
                  label={t("repayment.trustScoreUpdated", {
                    score: String(Math.round(successData.trustScore.score)),
                    band: successData.trustScore.band,
                  })}
                  value={`${Math.round(successData.trustScore.score)}/100`}
                />
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6 justify-center">
              <Button variant="secondary" onClick={() => onNavigate("active-loan")}>
                {t("repayment.viewLoanDetails")}
              </Button>
              <Button variant="primary" onClick={() => onNavigate("borrower-dashboard")}>
                {t("repayment.backToDashboard")}
              </Button>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  // ── Empty state: no active loan ──
  if (!activeLoan) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="repayment">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
          <PageHeader
            eyebrow={t("repayment.title")}
            title={t("repayment.title")}
            description={t("repayment.title")}
          />
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px]">
            <EmptyState
              icon={EmptyIcons.transactions}
              title={t("repayment.emptyTitle")}
              description={t("repayment.emptyDescription")}
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

  const progressPercent = totalExpected > 0 ? totalPaid / totalExpected : 0;
  const paidCount = schedules.filter((s) => s.status === "paid").length;

  // ── Main repayment view ──
  return (
    <AppLayout onNavigate={onNavigate} currentPage="repayment">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <PageHeader title={t("repayment.title")} description={activeLoan.name || "—"} />

        {loans.length > 1 && (
          <label className="mb-6 block max-w-sm text-sm font-medium text-navy">
            {t("activeLoan.title")}
            <select
              value={activeLoan.id}
              onChange={(event) => void handleLoanChange(event.target.value)}
              className="mt-1 block w-full rounded-[6px] border border-stone-300 bg-white px-3 py-2 text-sm text-navy"
            >
              {loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.name} - {loan.provider}
                </option>
              ))}
            </select>
          </label>
        )}

        {errorMessage && (
          <Alert variant="error" title={t("repayment.paymentFailed")} className="mb-4">
            {errorMessage}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left: Schedule + Payment Form ── */}
          <div className="lg:col-span-2 flex flex-col gap-5 min-w-0">
            {/* Loan summary card */}
            <Card variant="raised" className="p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between sm:items-start">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {t("repayment.totalOutstanding")}
                  </p>
                  <p className="font-display tabular-nums text-3xl font-semibold text-navy mt-1">
                    {formatTaka(totalOutstanding)}
                  </p>
                  <p className="text-sm text-stone-500 mt-1">
                    {t("activeLoan.monthsPaid", {
                      paid: paidCount,
                      total: schedules.length,
                    })}
                  </p>
                </div>
                <Badge
                  variant={totalOutstanding > 0 ? "warning" : "success"}
                  dot
                  className="shrink-0"
                >
                  {totalOutstanding > 0 ? t("repayment.due") : t("activeLoan.statusPaid")}
                </Badge>
              </div>
              {schedules.length > 0 && (
                <div className="mt-4">
                  <ProgressBar
                    value={Math.round(progressPercent * 100)}
                    max={100}
                    showValue
                    size="sm"
                    color="teal"
                  />
                </div>
              )}
            </Card>

            {/* Installment schedule table */}
            <Card variant="plain">
              <CardHeader
                title={t("repayment.selectInstallment")}
                description={t("repayment.chooseAmountHint")}
              />
              <DataTable
                caption={t("repayment.selectInstallment")}
                rows={schedules}
                rowKey={(r) => r.scheduleId}
                columns={[
                  {
                    key: "month",
                    header: "#",
                    render: (r) => `#${r.month}`,
                  },
                  {
                    key: "due",
                    header: t("repayment.due"),
                    render: (r) => formatDate(r.dueDate),
                  },
                  {
                    key: "expected",
                    header: t("repayment.expectedAmount"),
                    numeric: true,
                    render: (r) => formatTaka(r.expectedAmount),
                  },
                  {
                    key: "paid",
                    header: t("repayment.paidAmount"),
                    numeric: true,
                    hideBelow: "sm",
                    render: (r) => (
                      <span className={r.paidAmount > 0 ? "text-emerald" : ""}>
                        {formatTaka(r.paidAmount)}
                      </span>
                    ),
                  },
                  {
                    key: "outstanding",
                    header: t("repayment.outstandingAmount"),
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
                        <Badge variant={scheduleStatusVariant[r.status]} size="sm" dot>
                          {t(enumKey("activeLoan.status", r.status))}
                        </Badge>
                        {r.outstandingAmount > 0 && (
                          <Button
                            variant="tertiary"
                            size="xs"
                            onClick={() => handleSelectSchedule(r)}
                          >
                            {t("repayment.payNow")}
                          </Button>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </Card>

            {/* Payment form for selected installment */}
            {selectedSchedule && (
              <Card variant="raised" className="p-5 border-2 border-teal/30">
                <CardHeader
                  title={t("repayment.installmentNumber", {
                    number: String(selectedSchedule.month),
                  })}
                  description={`${t("repayment.due")} ${formatDate(selectedSchedule.dueDate)}`}
                />
                <CardBody className="flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-stone-500">{t("repayment.expectedAmount")}</p>
                      <p className="font-semibold tabular-nums">
                        {formatTaka(selectedSchedule.expectedAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-500">{t("repayment.paidAmount")}</p>
                      <p className="font-semibold tabular-nums text-emerald">
                        {formatTaka(selectedSchedule.paidAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-500">{t("repayment.outstandingAmount")}</p>
                      <p className="font-semibold tabular-nums text-coral">
                        {formatTaka(selectedSchedule.outstandingAmount)}
                      </p>
                    </div>
                  </div>

                  <CurrencyInput
                    label={t("repayment.paymentAmount")}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={selectedSchedule.outstandingAmount}
                    hint={t("repayment.maxPayment", {
                      amount: formatTaka(selectedSchedule.outstandingAmount),
                    })}
                    error={
                      parsedAmount > maxPayable
                        ? t("repayment.amountExceedsOutstanding")
                        : undefined
                    }
                  />

                  {paymentAccounts.length > 0 && (
                    <Select
                      label={t("paymentAccounts.repaymentAccount")}
                      options={paymentAccounts.map((acc) => {
                        const badge = getProviderBadge(acc.provider);
                        return {
                          value: acc.accountId,
                          label: `${badge.label} — ${maskAccountNumber(acc.accountNumber)}${acc.accountName ? ` (${acc.accountName})` : ""}`,
                        };
                      })}
                      value={selectedPaymentAccountId}
                      onChange={(e) => setSelectedPaymentAccountId(e.target.value)}
                    />
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleOpenConfirm}
                    disabled={!isAmountValid}
                  >
                    {t("repayment.payNow")} — {formatTaka(parsedAmount)}
                  </Button>
                </CardBody>
              </Card>
            )}

            {!selectedSchedule && outstandingSchedules.length > 0 && (
              <Alert variant="info" title={t("repayment.selectInstallment")} className="text-sm">
                {t("repayment.chooseAmountHint")}
              </Alert>
            )}
          </div>

          {/* ── Right sidebar: Payment summary ── */}
          <div className="flex flex-col gap-5 min-w-0 lg:sticky lg:top-6 lg:self-start">
            <Card variant="plain">
              <CardHeader title={t("repayment.summary")} />
              <CardBody>
                <DataRow label={t("repayment.loanSummary")} value={activeLoan.name} />
                <DataRow
                  label={t("repayment.totalOutstanding")}
                  value={formatTaka(totalOutstanding)}
                  emphasis
                />
                {selectedSchedule && (
                  <>
                    <div className="mt-2 pt-2 border-t border-stone-100">
                      <DataRow
                        label={t("repayment.instalment")}
                        value={`#${selectedSchedule.month}`}
                      />
                      <DataRow
                        label={t("repayment.paymentAmount")}
                        value={formatTaka(parsedAmount)}
                        emphasis
                      />
                      <DataRow
                        label={t("repayment.remainingAfter")}
                        value={formatTaka(Math.max(0, totalOutstanding - parsedAmount))}
                      />
                    </div>
                  </>
                )}
              </CardBody>
            </Card>
          </div>
        </div>

        {/* ── Confirmation modal ── */}
        <Modal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={t("repayment.confirmTitle")}
          footer={
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmOpen(false)}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={handleSubmitPayment}
              >
                {t("repayment.confirmAndPay")} — {formatTaka(parsedAmount)}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3">
            <Alert variant="info" title="MVP">
              {t("repayment.mvpDisclaimer")}
            </Alert>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t("repayment.confirmBody", {
                amount: formatTaka(parsedAmount),
                number: String(selectedSchedule?.month ?? ""),
              })}
            </p>
            <DataRow
              label={t("repayment.instalment")}
              value={`#${selectedSchedule?.month ?? ""}`}
            />
            <DataRow
              label={t("repayment.paymentAmount")}
              value={formatTaka(parsedAmount)}
              emphasis
            />
            <DataRow
              label={t("repayment.remainingAfter")}
              value={formatTaka(Math.max(0, totalOutstanding - parsedAmount))}
            />
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
