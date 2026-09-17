import { useMemo, useState, useEffect } from "react";
import { AppLayout } from "../components/AppLayout";
import { Card, CardHeader, CardBody, DataRow } from "../components/Card";
import { Badge } from "../components/Badge";
import { Button } from "../components/Button";
import { CurrencyInput, Select } from "../components/Input";
import { DataTable } from "../components/DataTable";
import { formatPercent, formatTaka, formatDate } from "../lib/format";
import { loansApi } from "../lib/api/index";
import type { PageName, RepaymentScheduleRow } from "../types";
import type { LoanProduct } from "@shohojrin/shared";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";

interface Props {
  onNavigate: (page: PageName) => void;
  productId?: string;
}

function calculateEmi(principal: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / months;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return emi;
}

const defaultLoan: LoanProduct = {
  id: "",
  name: "Loading...",
  provider: "",
  category: "personal",
  minAmount: 10000,
  maxAmount: 100000,
  interestRate: 10,
  durationMonths: 24,
  description: "",
  eligibility: [],
  tags: [],
};

export default function LoanDetails({ onNavigate, productId }: Props) {
  const { t } = useTranslation();
  const [loan, setLoan] = useState<LoanProduct>(defaultLoan);
  const [loadingProduct, setLoadingProduct] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        if (productId) {
          const data = await loansApi.getLoanProduct(productId);
          setLoan(data);
        } else {
          // Fallback: load first product
          const data = await loansApi.getLoanProducts();
          if (data.products.length > 0) {
            setLoan(data.products[0]);
          }
        }
      } catch {
        // keep default
      } finally {
        setLoadingProduct(false);
      }
    }
    fetchProduct();
  }, [productId]);

  const [amount, setAmount] = useState(loan.maxAmount / 2);
  const [duration, setDuration] = useState(String(loan.durationMonths));

  useEffect(() => {
    if (!loadingProduct) {
      setAmount(loan.maxAmount / 2);
      setDuration(String(loan.durationMonths));
    }
  }, [loan, loadingProduct]);

  const durationOptions = [12, 24, 36, 48]
    .filter((d) => d <= loan.durationMonths)
    .map((d) => ({
      value: String(d),
      label: t("loanDetails.monthsUnit", { months: d }),
    }));

  const { emi, totalRepayment, totalInterest } = useMemo(() => {
    const months = Number(duration) || loan.durationMonths;
    const monthlyEmi = calculateEmi(amount, loan.interestRate, months);
    const total = monthlyEmi * months;
    return {
      emi: monthlyEmi,
      totalRepayment: total,
      totalInterest: total - amount,
    };
  }, [amount, duration, loan]);

  const previewRows: RepaymentScheduleRow[] = useMemo(() => {
    const count = Math.min(6, Number(duration) || loan.durationMonths);
    const monthlyRate = loan.interestRate / 12 / 100;
    let balance = amount;
    const rows: RepaymentScheduleRow[] = [];
    const now = new Date();
    for (let i = 1; i <= count; i++) {
      const interestPart = Math.round(balance * monthlyRate);
      const principalPart = Math.round(emi - interestPart);
      balance = Math.max(0, balance - principalPart);
      const dueDate = new Date(now.getFullYear(), now.getMonth() + i, 15);
      rows.push({
        month: i,
        dueDate: dueDate.toISOString().slice(0, 10),
        principal: principalPart,
        interest: interestPart,
        total: Math.round(emi),
        status: i === 1 ? "due" : "upcoming",
      });
    }
    return rows;
  }, [amount, duration, loan, emi]);

  const fees = [
    { label: t("loanDetails.feeProcessing"), value: t("loanDetails.feeProcessingValue") },
    { label: t("loanDetails.feeLate"), value: t("loanDetails.feeLateValue") },
    { label: t("loanDetails.feePrepay"), value: t("loanDetails.feePrepayValue") },
  ];

  const columns = [
    { key: "month", header: t("activeLoan.scheduleMonth"), render: (r: RepaymentScheduleRow) => `#${r.month}` },
    {
      key: "dueDate",
      header: t("activeLoan.scheduleDue"),
      render: (r: RepaymentScheduleRow) => formatDate(r.dueDate),
    },
    {
      key: "principal",
      header: t("activeLoan.schedulePrincipal"),
      numeric: true,
      render: (r: RepaymentScheduleRow) => formatTaka(r.principal),
    },
    {
      key: "interest",
      header: t("activeLoan.scheduleInterest"),
      numeric: true,
      render: (r: RepaymentScheduleRow) => formatTaka(r.interest),
    },
    {
      key: "total",
      header: t("activeLoan.scheduleTotal"),
      numeric: true,
      render: (r: RepaymentScheduleRow) => formatTaka(r.total),
    },
    {
      key: "status",
      header: t("activeLoan.scheduleStatus"),
      render: (r: RepaymentScheduleRow) => (
        <Badge
          size="sm"
          variant={
            r.status === "paid"
              ? "success"
              : r.status === "overdue"
                ? "error"
                : r.status === "due"
                  ? "warning"
                  : "neutral"
          }
        >
          {r.status === "paid"
            ? t("activeLoan.statusPaid")
            : r.status === "overdue"
              ? t("activeLoan.statusOverdue")
              : r.status === "due"
                ? t("activeLoan.statusDue")
                : t("activeLoan.statusUpcoming")}
        </Badge>
      ),
    },
  ];

  return (
    <AppLayout onNavigate={onNavigate} currentPage="loan-marketplace">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <button
          type="button"
          onClick={() => onNavigate("loan-marketplace")}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:underline"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {t("loanDetails.backToMarketplace")}
        </button>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="info" size="sm">
                {t(enumKey("category", loan.category))}
              </Badge>
              {loan.tags.map((tItem) => (
                <Badge key={tItem} variant="neutral" size="sm">
                  {tItem}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl font-semibold text-navy sm:text-3xl">
              {loadingProduct ? t("common.loading") : loan.name}
            </h1>
            <p className="mt-1 text-sm text-stone-500">{loan.provider}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-6">
          <div className="flex flex-col gap-5 min-w-0">
            <Card>
              <CardHeader title={t("loanDetails.about")} />
              <CardBody>
                <p className="text-sm leading-relaxed text-stone-600">{loan.description}</p>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title={t("loanDetails.keyFacts")} />
              <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-stone-500">{t("loanDetails.interestRate")}</p>
                    <p className="tabular-nums text-base font-semibold text-navy mt-0.5">
                      {formatPercent(loan.interestRate)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-stone-500">{t("loanDetails.loanRange")}</p>
                    <p className="tabular-nums text-base font-semibold text-navy mt-0.5">
                      {formatTaka(loan.minAmount)}–{formatTaka(loan.maxAmount)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-stone-500">{t("loanDetails.tenure")}</p>
                    <p className="tabular-nums text-base font-semibold text-navy mt-0.5">
                      {t("loanDetails.upToMonths", { months: loan.durationMonths })}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-stone-500">{t("loanDetails.provider")}</p>
                    <p className="text-base font-semibold text-navy mt-0.5 truncate">
                      {loan.provider}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={t("loanDetails.eligibility")}
                description={t("loanDetails.eligibilityHint")}
              />
              <CardBody>
                <ul className="flex flex-col gap-2.5">
                  {loan.eligibility.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-light text-emerald flex items-center justify-center">
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path
                            d="M1 3.5L3.5 6L8 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="min-w-0">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={t("loanDetails.repaymentBreakdown")}
                description={t("loanDetails.repaymentBreakdownHint")}
              />
              <CardBody>
                <DataRow label={t("loanDetails.loanAmount")} value={formatTaka(amount)} />
                <DataRow label={t("loanDetails.interestRate")} value={formatPercent(loan.interestRate)} />
                <DataRow label={t("loanDetails.repaymentPeriod")} value={t("loanDetails.monthsUnit", { months: duration })} />
                <div className="border-t border-stone-200 mt-2 pt-2">
                  <DataRow
                    label={t("loanDetails.totalInterest")}
                    value={formatTaka(Math.round(totalInterest))}
                  />
                  <DataRow
                    label={t("loanDetails.totalRepayment")}
                    value={formatTaka(Math.round(totalRepayment))}
                    emphasis
                  />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={t("loanDetails.sampleSchedule")}
                description={t("loanDetails.sampleScheduleHint")}
              />
              <DataTable
                caption={t("loanDetails.sampleSchedule")}
                columns={columns}
                rows={previewRows}
                rowKey={(r) => String(r.month)}
              />
            </Card>

            <Card>
              <CardHeader title={t("loanDetails.fees")} />
              <CardBody>
                {fees.map((f) => (
                  <DataRow key={f.label} label={f.label} value={f.value} />
                ))}
              </CardBody>
            </Card>
          </div>

          <div className="min-w-0">
            <div className="lg:sticky lg:top-6">
              <Card variant="raised">
                <CardHeader title={t("loanDetails.estimate")} />
                <CardBody>
                  <div className="flex flex-col gap-4">
                    <CurrencyInput
                      label={t("loanDetails.loanAmount")}
                      value={amount}
                      min={loan.minAmount}
                      max={loan.maxAmount}
                      step={1000}
                      onChange={(e) => setAmount(Number(e.target.value) || loan.minAmount)}
                      hint={t("loanDetails.estimateHint", { min: formatTaka(loan.minAmount), max: formatTaka(loan.maxAmount) })}
                    />
                    <input
                      type="range"
                      min={loan.minAmount}
                      max={loan.maxAmount}
                      step={1000}
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      aria-label="Loan amount slider"
                      className="w-full accent-teal"
                    />
                    <Select
                      label={t("loanDetails.repaymentDuration")}
                      options={durationOptions}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                    <div className="border-t border-stone-200 pt-4 flex flex-col gap-1">
                      <DataRow
                        label={t("loanDetails.estimatedEmi")}
                        value={formatTaka(Math.round(emi))}
                        emphasis
                      />
                      <DataRow
                        label={t("loanDetails.totalInterest")}
                        value={formatTaka(Math.round(totalInterest))}
                      />
                      <DataRow
                        label={t("loanDetails.totalRepayment")}
                        value={formatTaka(Math.round(totalRepayment))}
                      />
                    </div>
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => onNavigate("loan-application")}
                    >
                      {t("loanDetails.applyForThisLoan")}
                    </Button>
                    <p className="text-xs text-stone-400 text-center">
                      {t("loanDetails.estimateDisclaimer")}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
