import { useEffect, useState } from "react";
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
import type { PageName, Transaction } from "../types";

interface Props {
  onNavigate: (page: PageName) => void;
}

type AmountOption = "full" | "custom" | "payoff";
type PaymentMethod = "bkash" | "nagad" | "bank" | "card";
const methodInfo: Record<
  PaymentMethod,
  { label: string; fee: (amt: number) => number; hint: string }
> = {
  bkash: {
    label: "bKash",
    fee: (amt) => Math.round(amt * 0.015),
    hint: "1.5% bKash processing fee",
  },
  nagad: {
    label: "Nagad",
    fee: (amt) => Math.round(amt * 0.012),
    hint: "1.2% Nagad processing fee",
  },
  bank: { label: "Bank transfer", fee: () => 0, hint: "No fee — funds may take 1 business day" },
  card: {
    label: "Debit/credit card",
    fee: (amt) => Math.round(amt * 0.02) + 10,
    hint: "2% + ৳10 card processing fee",
  },
};

export default function RepaymentPage({ onNavigate }: Props) {
  const [activeLoan, setActiveLoan] = useState<any>(null);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
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
    (t) => t.type === "repayment" || t.type === "fee",
  );

  if (isLoading) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="repayment">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-10 flex justify-center items-center h-64">
          <p className="text-stone-500">Loading repayment details...</p>
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
              {receiptData.completed ? "Loan Fully Repaid! 🎉" : "Payment successful"}
            </h1>
            <p className="text-sm text-stone-500 mb-6">
              {receiptData.completed
                ? `Congratulations! You have completed all repayments for loan ${receiptData.loanId}.`
                : `Your payment has been received and applied to loan ${receiptData.loanId}.`}
            </p>
            <div className="text-left bg-stone-50 border border-stone-200 rounded-[8px] p-4">
              <DataRow label="Receipt no." value={receiptData.receiptId} />
              <DataRow label="Paid via" value={methodInfo[method].label} />
              <DataRow label="Instalment" value={formatTaka(receiptData.amount)} />
              <DataRow label="Processing fee" value={formatTaka(receiptData.fee)} />
              <DataRow
                label="Total charged"
                value={formatTaka(receiptData.totalCharged)}
                emphasis
              />
              <DataRow label="Remaining balance" value={formatTaka(receiptData.remainingAfter)} />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-6 justify-center">
              <Button variant="secondary" onClick={() => onNavigate("active-loan")}>
                View loan details
              </Button>
              <Button variant="primary" onClick={() => onNavigate("borrower-dashboard")}>
                Back to dashboard
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
            eyebrow="Repayment"
            title="Make a repayment"
            description="Clear and secure loan repayments with instant receipt generation."
          />
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px]">
            <EmptyState
              icon={EmptyIcons.transactions}
              title="No payments due"
              description="You do not currently have any active loans requiring repayment."
              action={{ label: "Explore loans", onClick: () => onNavigate("loan-marketplace") }}
              secondaryAction={{ label: "Learn more", onClick: () => onNavigate("education") }}
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
          title="Make a payment"
          description={`Loan ${activeLoan.id} — ${activeLoan.name}`}
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-5 min-w-0">
            <Card variant="raised" className="p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between sm:items-start">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Amount due
                  </p>
                  <p className="font-display tabular-nums text-3xl font-semibold text-navy mt-1">
                    {formatTaka(activeLoan.monthlyPayment)}
                  </p>
                  <p className="text-sm text-stone-500 mt-1">
                    Due {formatDate(activeLoan.nextPaymentDate)}
                  </p>
                </div>
                <Badge variant="warning" dot className="shrink-0">
                  Due
                </Badge>
              </div>
              {isOverdue && (
                <Alert variant="error" title="Payment overdue" className="mt-4">
                  This instalment is past due. A late fee may apply if not paid within 3 days.
                </Alert>
              )}
            </Card>
            <Card variant="plain">
              <CardHeader
                title="Choose amount"
                description="Pay your regular instalment, a custom amount, or clear the loan early."
              />
              <CardBody className="flex flex-col gap-4">
                <Radio
                  name="amount-option"
                  label={`Pay full instalment — ${formatTaka(activeLoan.monthlyPayment)}`}
                  value="full"
                  checked={amountOption === "full"}
                  onChange={() => setAmountOption("full")}
                />
                <Radio
                  name="amount-option"
                  label="Pay a custom amount"
                  value="custom"
                  checked={amountOption === "custom"}
                  onChange={() => setAmountOption("custom")}
                />
                {amountOption === "custom" && (
                  <div className="ml-6.5">
                    <CurrencyInput
                      label="Custom amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      max={activeLoan.remainingBalance}
                      hint={`Maximum ${formatTaka(activeLoan.remainingBalance)}`}
                    />
                  </div>
                )}
                <Radio
                  name="amount-option"
                  label={`Pay off early — ${formatTaka(activeLoan.remainingBalance)}`}
                  value="payoff"
                  checked={amountOption === "payoff"}
                  onChange={() => setAmountOption("payoff")}
                />
              </CardBody>
            </Card>
            <Card variant="plain">
              <CardHeader
                title="Payment method"
                description="A small processing fee may apply depending on your method."
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
              Confirm and pay {formatTaka(totalCharged)}
            </Button>
          </div>
          <div className="flex flex-col gap-5 min-w-0 lg:sticky lg:top-6 lg:self-start">
            <Card variant="plain">
              <CardHeader title="Payment summary" />
              <CardBody>
                <DataRow label="Instalment" value={formatTaka(instalmentAmount)} />
                <DataRow
                  label="Processing fee"
                  value={formatTaka(fee)}
                  hint={methodInfo[method].hint}
                />
                <DataRow label="Total charged" value={formatTaka(totalCharged)} emphasis />
                <div className="mt-2 pt-2 border-t border-stone-100">
                  <DataRow
                    label="Remaining balance after this payment"
                    value={formatTaka(remainingAfter)}
                  />
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
        <Card variant="plain" className="mt-6">
          <CardHeader title="Recent payments" />
          <DataTable
            caption="Recent payments"
            rows={recentPayments}
            rowKey={(t) => t.id}
            columns={[
              { key: "date", header: "Date", render: (t) => formatDate(t.date) },
              {
                key: "desc",
                header: "Description",
                render: (t) => (
                  <span className="block min-w-0 truncate max-w-[220px]">{t.description}</span>
                ),
              },
              {
                key: "amount",
                header: "Amount",
                numeric: true,
                render: (t) => <span className="text-coral">−{formatTaka(t.amount)}</span>,
              },
              {
                key: "status",
                header: "Status",
                render: (t) => (
                  <Badge
                    variant={
                      t.status === "completed"
                        ? "success"
                        : t.status === "pending"
                          ? "warning"
                          : "error"
                    }
                    size="sm"
                    dot
                  >
                    {t.status}
                  </Badge>
                ),
              },
            ]}
          />
        </Card>
        <Modal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirm payment"
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setConfirmOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const result = await loansApi.createRepayment(activeLoan.id, instalmentAmount, method);
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
                Pay {formatTaka(totalCharged)}
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-1">
            <p className="text-sm text-stone-600 leading-relaxed mb-2">
              You are about to pay{" "}
              <span className="tabular-nums font-semibold text-navy">
                {formatTaka(totalCharged)}
              </span>{" "}
              via {methodInfo[method].label} for loan {activeLoan.id}.
            </p>
            <DataRow label="Instalment" value={formatTaka(instalmentAmount)} />
            <DataRow label="Processing fee" value={formatTaka(fee)} />
            <DataRow label="Total charged" value={formatTaka(totalCharged)} emphasis />
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
