"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";
import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/PageHeader";
import { Card, CardHeader, CardBody, DataRow } from "../components/Card";
import { Badge } from "../components/Badge";
import { Alert } from "../components/Alert";
import { Radio, CurrencyInput } from "../components/Input";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { DataTable } from "../components/DataTable";
import { EmptyState, EmptyIcons } from "../components/EmptyState";
import { loansApi } from "../lib/api/index";
import { formatTaka, formatDate } from "../lib/format";
import type { PageName, Transaction, ActiveLoan } from "../types";

interface Props {
  onNavigate: (page: PageName) => void;
}

type AmountOption = "full" | "custom" | "payoff";
type PaymentMethod = "bkash" | "nagad" | "bank" | "card";

export default function RepaymentPage({ onNavigate }: Props) {
  const { t } = useTranslation();
  
  const [activeLoan, setActiveLoan] = useState<ActiveLoan | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [amountOption, setAmountOption] = useState<AmountOption>("full");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [method, setMethod] = useState<PaymentMethod>("bkash");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    receiptId: string;
    completed: boolean;
    loanId: string;
    amount: number;
    fee: number;
    totalCharged: number;
    remainingAfter: number;
  } | null>(null);

  const methodInfo: Record<
    PaymentMethod,
    { label: string; fee: (amt: number) => number; hint: string }
  > = {
    bkash: {
      label: t("repayment.methodBkash"),
      fee: (amt) => Math.round(amt * 0.015),
      hint: t("repayment.methodBkashHint"),
    },
    nagad: {
      label: t("repayment.methodNagad"),
      fee: (amt) => Math.round(amt * 0.012),
      hint: t("repayment.methodNagadHint"),
    },
    bank: { 
      label: t("repayment.methodBank"), 
      fee: () => 0, 
      hint: t("repayment.methodBankHint") 
    },
    card: {
      label: t("repayment.methodCard"),
      fee: (amt) => Math.round(amt * 0.02) + 10,
      hint: t("repayment.methodCardHint"),
    },
  };

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const loansRes = await loansApi.getActiveLoans();
        const loan = loansRes[0] || null;
        setActiveLoan(loan);

        if (loan) {
          const txs = await loansApi.getLoanTransactions(loan.id);
          setAllTransactions(txs || []);
        }
      } catch (e) {
        console.error("Failed to fetch repayment data", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const recentPayments: Transaction[] = allTransactions.filter(
    (tx) => tx.type === "repayment" || tx.type === "fee",
  );

  if (isLoading) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="repayment">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10 flex justify-center items-center h-64">
          <p className="text-stone-500">{t("common.loading")}</p>
        </div>
      </AppLayout>
    );
  }

  if (success && receiptData) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="repayment">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10">
          <Card variant="raised" className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-light border-[1.5px] border-emerald flex items-center justify-center text-2xl text-emerald mx-auto mb-4">
              ✓
            </div>
            <h1 className="text-2xl font-semibold text-navy mb-1">
              {receiptData.completed ? t("repayment.successTitleCompleted") : t("repayment.successTitle")}
            </h1>
            <p className="text-sm text-stone-500 mb-6">
              {receiptData.completed
                ? t("repayment.successBodyCompleted")
                : t("repayment.successBody")}
            </p>
            <div className="text-left bg-stone-50 border border-stone-200 rounded-[8px] p-4">
              <DataRow label={t("repayment.receiptNo")} value={receiptData.receiptId} />
              <DataRow label={t("repayment.paidVia")} value={methodInfo[method].label} />
              <DataRow label={t("repayment.instalment")} value={formatTaka(receiptData.amount)} />
              <DataRow label={t("repayment.processingFee")} value={formatTaka(receiptData.fee)} />
              <DataRow
                label={t("repayment.totalCharged")}
                value={formatTaka(receiptData.totalCharged)}
                emphasis
              />
              <DataRow label={t("repayment.remainingAfter")} value={formatTaka(receiptData.remainingAfter)} />
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

  if (!activeLoan) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="repayment">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
          <PageHeader
            eyebrow={t("repayment.title")}
            title={t("repayment.title")}
            description={t("repayment.subtitle")}
          />
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px]">
            <EmptyState
              icon={EmptyIcons.transactions}
              title={t("repayment.emptyTitle")}
              description={t("repayment.emptyDescription")}
              action={{ label: t("dashboard.exploreLoans"), onClick: () => onNavigate("loan-marketplace") }}
              secondaryAction={{ label: t("dashboard.learnMore"), onClick: () => onNavigate("education") }}
            />
          </div>
        </div>
      </AppLayout>
    );
  }

  const isOverdue = false;
  const instalmentAmount =
    amountOption === "full"
      ? activeLoan.monthlyPayment
      : amountOption === "payoff"
        ? activeLoan.remainingBalance
        : Math.max(0, Number(customAmount) || 0);
  const fee = methodInfo[method].fee(instalmentAmount);
  const totalCharged = instalmentAmount + fee;
  const remainingAfter = Math.max(0, activeLoan.remainingBalance - instalmentAmount);

  return (
    <AppLayout onNavigate={onNavigate} currentPage="repayment">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          title={t("repayment.title")}
          description={`${t("application.stepLoanDetails")} — ${activeLoan.name}`}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-5 min-w-0">
            <Card variant="raised" className="p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between sm:items-start">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    {t("repayment.amountDue")}
                  </p>
                  <p className="font-display tabular-nums text-3xl font-semibold text-navy mt-1">
                    {formatTaka(activeLoan.monthlyPayment)}
                  </p>
                  <p className="text-sm text-stone-500 mt-1">
                    {t("repayment.due")} {formatDate(activeLoan.nextPaymentDate)}
                  </p>
                </div>
                <Badge variant="warning" dot className="shrink-0">
                  {t("repayment.due")}
                </Badge>
              </div>
              {isOverdue && (
                <Alert variant="error" title={t("repayment.overdueTitle")} className="mt-4">
                  {t("repayment.overdueBody")}
                </Alert>
              )}
            </Card>
            <Card variant="plain">
              <CardHeader
                title={t("repayment.chooseAmount")}
                description={t("repayment.chooseAmountHint")}
              />
              <CardBody className="flex flex-col gap-4">
                <Radio
                  name="amount-option"
                  label={`${t("repayment.payFullInstalment")} — ${formatTaka(activeLoan.monthlyPayment)}`}
                  value="full"
                  checked={amountOption === "full"}
                  onChange={() => setAmountOption("full")}
                />
                <Radio
                  name="amount-option"
                  label={t("repayment.payCustomAmount")}
                  value="custom"
                  checked={amountOption === "custom"}
                  onChange={() => setAmountOption("custom")}
                />
                {amountOption === "custom" && (
                  <div className="ml-6.5">
                    <CurrencyInput
                      label={t("repayment.customAmount")}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      max={activeLoan.remainingBalance}
                      hint={t("repayment.customAmountHint", { amount: formatTaka(activeLoan.remainingBalance) })}
                    />
                  </div>
                )}
                <Radio
                  name="amount-option"
                  label={`${t("repayment.payOffEarly")} — ${formatTaka(activeLoan.remainingBalance)}`}
                  value="payoff"
                  checked={amountOption === "payoff"}
                  onChange={() => setAmountOption("payoff")}
                />
              </CardBody>
            </Card>
            <Card variant="plain">
              <CardHeader
                title={t("repayment.paymentMethod")}
                description={t("repayment.paymentMethodHint")}
              />
              <CardBody className="flex flex-col gap-4">
                {(Object.keys(methodInfo) as PaymentMethod[]).map((m) => (
                  <div key={m} className="flex flex-col gap-0.5">
                    <Radio
                      name="payment-method"
                      label={methodInfo[m].label}
                      value={m}
                      checked={method === m}
                      onChange={() => setMethod(m as PaymentMethod)}
                    />
                    <p className="text-xs text-stone-400 ml-6.5">{methodInfo[m].hint}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => setConfirmOpen(true)}
              disabled={instalmentAmount <= 0}
            >
              {t("repayment.confirmAndPay")} {formatTaka(totalCharged)}
            </Button>
          </div>
          <div className="flex flex-col gap-5 min-w-0 lg:sticky lg:top-6 lg:self-start">
            <Card variant="plain">
              <CardHeader title={t("repayment.summary")} />
              <CardBody>
                <DataRow label={t("repayment.instalment")} value={formatTaka(instalmentAmount)} />
                <DataRow
                  label={t("repayment.processingFee")}
                  value={formatTaka(fee)}
                  hint={methodInfo[method].hint}
                />
                <DataRow label={t("repayment.totalCharged")} value={formatTaka(totalCharged)} emphasis />
                <div className="mt-2 pt-2 border-t border-stone-100">
                  <DataRow
                    label={t("repayment.remainingAfter")}
                    value={formatTaka(remainingAfter)}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
        <Card variant="plain" className="mt-6">
          <CardHeader title={t("repayment.recentPayments")} />
          <DataTable
            caption={t("repayment.recentPayments")}
            rows={recentPayments}
            rowKey={(tx) => tx.id}
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
                key: "amount",
                header: t("common.amount"),
                numeric: true,
                render: (tx) => <span className="text-coral">−{formatTaka(tx.amount)}</span>,
              },
              {
                key: "status",
                header: t("common.status"),
                render: (tx) => (
                  <Badge
                    variant={
                      tx.status === "completed"
                        ? "success"
                        : tx.status === "pending"
                          ? "warning"
                          : "error"
                    }
                    size="sm"
                    dot
                  >
                    {t(enumKey("dashboard.tx", tx.status))}
                  </Badge>
                ),
              },
            ]}
          />
        </Card>
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
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const result = await loansApi.createRepayment(
                      activeLoan.id,
                      instalmentAmount,
                      method,
                    );
                    setReceiptData({
                      receiptId: result.receiptId || "RCPT-" + Math.floor(Math.random() * 10000),
                      completed: result.loan?.status === "completed",
                      loanId: activeLoan.id,
                      amount: instalmentAmount,
                      fee,
                      totalCharged,
                      remainingAfter: result.loan?.status === "completed" ? 0 : remainingAfter,
                    });
                    setConfirmOpen(false);
                    setSuccess(true);
                  } catch (e) {
                    console.error("Payment failed", e);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {t("repayment.confirmAndPay")} {formatTaka(totalCharged)}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm text-stone-600 leading-relaxed mb-2">
              {t("repayment.confirmBody", { amount: formatTaka(totalCharged), method: methodInfo[method].label })}
            </p>
            <DataRow label={t("repayment.instalment")} value={formatTaka(instalmentAmount)} />
            <DataRow label={t("repayment.processingFee")} value={formatTaka(fee)} />
            <DataRow label={t("repayment.totalCharged")} value={formatTaka(totalCharged)} emphasis />
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
