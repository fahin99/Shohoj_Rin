"use client";

import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { Card, CardHeader, CardBody, DataRow } from "../components/Card";
import { Button } from "../components/Button";
import { Stepper } from "../components/Progress";
import { Alert } from "../components/Alert";
import { CurrencyInput, TextInput, Select, Textarea } from "../components/Input";
import { formatTaka } from "../lib/format";
import { loansApi, applicationsApi } from "../lib/api/index";
import type { PageName, LoanProduct } from "../types";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";

interface Props {
  onNavigate: (page: PageName) => void;
}

function calculateEmi(principal: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 12 / 100;
  if (!principal || !months) return 0;
  if (monthlyRate === 0) return principal / months;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

interface FormState {
  loanId: string;
  amount: number;
  duration: string;
  purpose: string;
  phone: string;
  employment: string;
  monthlyIncome: number;
}

export default function LoanApplication({ onNavigate }: Props) {
  const { t } = useTranslation();

  const steps = [
    { label: t("application.stepLoanDetails") },
    { label: t("application.stepEmployment") },
    { label: t("application.stepReview") },
  ];

  const durationOptions = [12, 18, 24, 36, 48].map((d) => ({
    value: String(d),
    label: t("loanDetails.monthsUnit", { count: d }),
  }));

  const employmentOptions = [
    { value: "salaried", label: t("employment.employed-full") },
    { value: "self-employed", label: t("employment.self-employed") },
    { value: "business-owner", label: t("employment.business") },
    { value: "student", label: t("employment.student") },
  ];

  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const res = await loansApi.getLoanProducts();
        setLoanProducts(res.products || []);
      } catch (e) {
        console.error("Failed to fetch loan products", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const defaultLoan = loanProducts[0] || {
    id: "",
    maxAmount: 100000,
    minAmount: 1000,
    durationMonths: 12,
    interestRate: 10,
    name: "",
    provider: "",
  };

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<FormState>({
    loanId: "",
    amount: 0,
    duration: "",
    purpose: "",
    phone: "",
    employment: "",
    monthlyIncome: 0,
  });

  // Init form defaults when products load
  useEffect(() => {
    if (loanProducts.length > 0 && !form.loanId) {
      const loan = loanProducts[0];
      setForm((f) => ({
        ...f,
        loanId: loan.id,
        amount: Math.round(loan.maxAmount / 2),
        duration: String(loan.durationMonths),
      }));
    }
  }, [loanProducts, form.loanId]);

  const selectedLoan = loanProducts.find((l) => l.id === form.loanId) ?? defaultLoan;

  const emi = useMemo(
    () => calculateEmi(form.amount, selectedLoan.interestRate, Number(form.duration)),
    [form.amount, form.duration, selectedLoan],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validateStep(current: number): boolean {
    const next: Record<string, string> = {};
    if (current === 0) {
      if (!form.amount || form.amount < selectedLoan.minAmount)
        next.amount = t("application.errorAmountMin", {
          amount: formatTaka(selectedLoan.minAmount),
        });
      if (form.amount > selectedLoan.maxAmount)
        next.amount = t("application.errorAmountMax", {
          amount: formatTaka(selectedLoan.maxAmount),
        });
      if (!form.duration) next.duration = t("application.errorDuration");
      if (!form.purpose.trim()) next.purpose = t("application.errorPurpose");
    }
    if (current === 1) {
      if (!/^01\d{9}$/.test(form.phone.replace(/\s/g, "")))
        next.phone = t("application.errorPhone");
      if (!form.employment) next.employment = t("application.errorEmployment");
      if (!form.monthlyIncome || form.monthlyIncome <= 0)
        next.monthlyIncome = t("application.errorIncome");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleNext() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(steps.length - 1, s + 1));
  }

  function handleBack() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit() {
    if (!validateStep(step)) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const applicationData = {
        requestedAmount: form.amount,
        purpose: selectedLoan.category ?? "personal",
        purposeDescription: form.purpose,
        ...(form.loanId ? { productId: form.loanId } : {}),
      };
      await applicationsApi.createApplication(applicationData);
      onNavigate("application-status");
    } catch (e) {
      console.error("Submission failed", e);
      setSubmitError(e instanceof Error ? e.message : "Failed to submit your application");
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="loan-marketplace">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex justify-center items-center h-64">
          <p className="text-stone-500">{t("common.loading")}</p>
        </div>
      </AppLayout>
    );
  }

  const summary = (
    <Card variant="raised">
      <CardHeader title={t("application.summary")} />
      <CardBody>
        <DataRow label={t("application.loanProduct")} value={selectedLoan.name || "—"} />
        <DataRow label={t("loanDetails.loanAmount")} value={formatTaka(form.amount || 0)} />
        <DataRow
          label={t("loanDetails.repaymentDuration")}
          value={t("loanDetails.monthsUnit", {
            count: form.duration || selectedLoan.durationMonths,
          })}
        />
        <div className="border-t border-stone-200 mt-2 pt-2">
          <DataRow
            label={t("application.estimatedEmi")}
            value={formatTaka(Math.round(emi))}
            emphasis
          />
        </div>
      </CardBody>
    </Card>
  );

  return (
    <AppLayout onNavigate={onNavigate} currentPage="loan-marketplace">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-navy sm:text-3xl">{t("application.title")}</h1>
          <p className="mt-1.5 text-sm text-stone-500">
            {selectedLoan.name} — {selectedLoan.provider}
          </p>
        </div>
        <div className="mb-6 overflow-x-auto">
          <Stepper steps={steps} currentStep={step} />
        </div>
        {}
        <div className="lg:hidden mb-5">{summary}</div>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-6">
          <div className="min-w-0">
            <Card>
              <CardHeader
                title={steps[step].label}
                description={t("onboarding.stepOf", { current: step + 1, total: steps.length })}
              />
              <CardBody>
                <div
                  role="group"
                  aria-current="step"
                  aria-label={steps[step].label}
                  className="flex flex-col gap-4"
                >
                  {step === 0 && (
                    <>
                      <Select
                        label={t("application.loanProduct")}
                        required
                        options={loanProducts.map((l) => ({
                          value: l.id,
                          label: `${l.name} — ${l.provider}`,
                        }))}
                        value={form.loanId}
                        onChange={(e) => update("loanId", e.target.value)}
                      />
                      <CurrencyInput
                        label={t("loanDetails.loanAmount")}
                        required
                        value={form.amount}
                        error={errors.amount}
                        min={selectedLoan.minAmount}
                        max={selectedLoan.maxAmount}
                        onChange={(e) => update("amount", Number(e.target.value))}
                        hint={t("loanDetails.loanRange", {
                          min: formatTaka(selectedLoan.minAmount),
                          max: formatTaka(selectedLoan.maxAmount),
                        })}
                      />
                      <Select
                        label={t("loanDetails.repaymentDuration")}
                        required
                        options={durationOptions.filter(
                          (d) => Number(d.value) <= selectedLoan.durationMonths,
                        )}
                        placeholder={t("application.errorDuration")}
                        value={form.duration}
                        error={errors.duration}
                        onChange={(e) => update("duration", e.target.value)}
                      />
                      <Textarea
                        label={t("application.purpose")}
                        required
                        placeholder={t("application.purposePlaceholder")}
                        value={form.purpose}
                        error={errors.purpose}
                        onChange={(e) => update("purpose", e.target.value)}
                      />
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <div className="bg-emerald-light/60 border border-emerald/30 rounded-[6px] p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald text-white flex items-center justify-center text-xs font-bold">
                            ✓
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-emerald-800">
                              {t("application.identityVerified")}
                            </p>
                            <p className="text-xs text-stone-600">
                              {t("application.identityVerifiedBody")}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-emerald bg-white px-2 py-0.5 rounded border border-emerald/20 shrink-0">
                          {t("application.profileKyc")}
                        </span>
                      </div>
                      <TextInput
                        label={t("application.contactMobile")}
                        required
                        placeholder="01XXXXXXXXX"
                        value={form.phone}
                        error={errors.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        hint={t("application.contactMobileHint")}
                      />
                      <Select
                        label={t("application.employmentType")}
                        required
                        placeholder={t("application.employmentType")}
                        options={employmentOptions}
                        value={form.employment}
                        error={errors.employment}
                        onChange={(e) => update("employment", e.target.value)}
                      />
                      <CurrencyInput
                        label={t("application.monthlyIncome")}
                        required
                        value={form.monthlyIncome || ""}
                        error={errors.monthlyIncome}
                        onChange={(e) => update("monthlyIncome", Number(e.target.value))}
                      />
                    </>
                  )}
                  {step === 2 && (
                    <div className="flex flex-col gap-4">
                      <Alert variant="success" title={t("application.readyToSubmit")}>
                        {t("application.readyToSubmitBody")}
                      </Alert>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                          {t("application.stepLoanDetails")}
                        </p>
                        <DataRow label={t("application.loanProduct")} value={selectedLoan.name} />
                        <DataRow
                          label={t("loanDetails.loanAmount")}
                          value={formatTaka(form.amount)}
                        />
                        <DataRow
                          label={t("loanDetails.repaymentDuration")}
                          value={t("loanDetails.monthsUnit", { count: form.duration })}
                        />
                        <DataRow label={t("application.purpose")} value={form.purpose || "—"} />
                      </div>
                      <div className="border-t border-stone-200 pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                          {t("application.stepEmployment")}
                        </p>
                        <DataRow
                          label={t("profile.personalIdentity")}
                          value={`${t("application.identityVerified")} ✓`}
                        />
                        <DataRow
                          label={t("lender.address")}
                          value={`${t("application.identityVerified")} ✓`}
                        />
                        <DataRow
                          label={t("lender.income")}
                          value={`${t("application.identityVerified")} ✓`}
                        />
                        <DataRow label={t("application.contactMobile")} value={form.phone || "—"} />
                        <DataRow
                          label={t("application.employmentType")}
                          value={
                            employmentOptions.find((o) => o.value === form.employment)?.label ?? "—"
                          }
                        />
                        <DataRow
                          label={t("application.monthlyIncome")}
                          value={form.monthlyIncome ? formatTaka(form.monthlyIncome) : "—"}
                        />
                      </div>
                      <div className="border-t border-stone-200 pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                          {t("application.profileKyc")}
                        </p>
                        <DataRow
                          label={t("profile.personalIdentity")}
                          value={`${t("application.identityVerified")} ✓`}
                        />
                        <DataRow
                          label={t("lender.address")}
                          value={`${t("application.identityVerified")} ✓`}
                        />
                        <DataRow
                          label={t("lender.income")}
                          value={`${t("application.identityVerified")} ✓`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
            {submitError && (
              <Alert variant="error" title="Application could not be submitted">
                {submitError}
              </Alert>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
              <Button variant="secondary" onClick={handleBack} disabled={step === 0 || submitting}>
                {t("common.back")}
              </Button>
              {step < steps.length - 1 ? (
                <Button variant="primary" onClick={handleNext}>
                  {t("common.next")}
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSubmit} loading={submitting}>
                  {submitting ? t("application.submitting") : t("application.submit")}
                </Button>
              )}
            </div>
          </div>
          {}
          <div className="hidden lg:block min-w-0">
            <div className="lg:sticky lg:top-6">{summary}</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
