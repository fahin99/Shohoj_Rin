"use client";

import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { Card, CardHeader, CardBody, DataRow } from "../components/Card";
import { Button } from "../components/Button";
import { Stepper } from "../components/Progress";
import { Alert } from "../components/Alert";
import { CurrencyInput, Select, Textarea } from "../components/Input";
import { formatTaka } from "../lib/format";
import { loansApi, applicationsApi, profileApi } from "../lib/api/index";
import type { PageName, LoanProduct } from "../types";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";
import type { ProfileData } from "../lib/api/profile";

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
}

export default function LoanApplication({ onNavigate }: Props) {
  const { t } = useTranslation();

  const steps = [
    { label: t("application.stepLoanDetails") },
    { label: t("application.stepEmployment") },
    { label: t("application.stepReview") },
  ];

  const [loanProducts, setLoanProducts] = useState<LoanProduct[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function loadApplicationData() {
      setIsLoading(true);
      setLoadError("");
      try {
        const [res, profileResponse] = await Promise.all([
          loansApi.getLoanProducts(),
          profileApi.getProfile(),
        ]);
        setLoanProducts(res.products || []);
        setProfile(profileResponse.profile);
      } catch (e) {
        console.error("Failed to load application data", e);
        setLoadError(t("common.requestFailed"));
      } finally {
        setIsLoading(false);
      }
    }
    void loadApplicationData();
  }, [t]);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState<FormState>({
    loanId: "",
    amount: 0,
    duration: "",
    purpose: "",
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

  const selectedLoan = loanProducts.find((l) => l.id === form.loanId) ?? null;

  const durationOptions = Array.from(
    new Set([12, 18, 24, 36, 48, selectedLoan?.durationMonths].filter(Boolean)),
  )
    .filter(
      (months): months is number =>
        typeof months === "number" && months <= (selectedLoan?.durationMonths ?? 0),
    )
    .sort((a, b) => a - b)
    .map((months) => ({
      value: String(months),
      label: t("loanDetails.monthsUnit", { months }),
    }));

  const emi = useMemo(
    () => calculateEmi(form.amount, selectedLoan?.interestRate ?? 0, Number(form.duration)),
    [form.amount, form.duration, selectedLoan],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function validateStep(current: number): boolean {
    const next: Record<string, string> = {};
    if (current === 0) {
      if (!selectedLoan) next.loanId = t("application.noLoanProducts");
      else if (!form.amount || form.amount < selectedLoan.minAmount)
        next.amount = t("application.errorAmountMin", {
          amount: formatTaka(selectedLoan.minAmount),
        });
      if (selectedLoan && form.amount > selectedLoan.maxAmount)
        next.amount = t("application.errorAmountMax", {
          amount: formatTaka(selectedLoan.maxAmount),
        });
      if (!form.duration) next.duration = t("application.errorDuration");
      if (!form.purpose.trim()) next.purpose = t("application.errorPurpose");
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
        durationMonths: Number(form.duration),
        purpose: selectedLoan?.category ?? "personal",
        purposeDescription: form.purpose,
        ...(form.loanId ? { productId: form.loanId } : {}),
      };
      await applicationsApi.createApplication(applicationData);
      onNavigate("application-status");
    } catch (e) {
      console.error("Submission failed", e);
      setSubmitError(t("common.requestFailed"));
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

  if (loadError || !profile || loanProducts.length === 0 || !selectedLoan) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="loan-marketplace">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
          <Alert variant="error" title={t("application.unavailableTitle")}>
            {loadError ||
              (loanProducts.length === 0
                ? t("application.noLoanProducts")
                : t("application.profileLoadFailed"))}
          </Alert>
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
            months: form.duration || selectedLoan.durationMonths,
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
            {selectedLoan.name || "—"} — {selectedLoan.provider || "—"}
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
                description={t("onboarding.stepOf", { step: step + 1, total: steps.length })}
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
                        options={durationOptions}
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
                      <div className="rounded-[6px] border border-stone-200 bg-stone-50 p-4">
                        <p className="text-sm font-medium text-navy">
                          {t("application.profileConfirmation")}
                        </p>
                        <p className="mt-1 text-xs text-stone-600">
                          {t("application.profileConfirmationBody")}
                        </p>
                        <div className="mt-3 border-t border-stone-200 pt-3">
                          <DataRow
                            label={t("application.contactMobile")}
                            value={profile.phone || "—"}
                          />
                          <DataRow
                            label={t("application.employmentType")}
                            value={
                              profile.employment_type
                                ? t(enumKey("employment", profile.employment_type))
                                : "—"
                            }
                          />
                          <DataRow
                            label={t("application.monthlyIncome")}
                            value={
                              profile.monthly_income != null
                                ? formatTaka(Number(profile.monthly_income))
                                : "—"
                            }
                          />
                          {profile.employer_name && (
                            <DataRow
                              label={t("profile.employerName")}
                              value={profile.employer_name}
                            />
                          )}
                          {profile.institution_name && (
                            <DataRow
                              label={t("profile.institution")}
                              value={profile.institution_name}
                            />
                          )}
                        </div>
                      </div>
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
                          value={t("loanDetails.monthsUnit", { months: form.duration })}
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
                        <DataRow
                          label={t("application.contactMobile")}
                          value={profile.phone || "—"}
                        />
                        <DataRow
                          label={t("application.employmentType")}
                          value={
                            profile.employment_type
                              ? t(enumKey("employment", profile.employment_type))
                              : "—"
                          }
                        />
                        <DataRow
                          label={t("application.monthlyIncome")}
                          value={
                            profile.monthly_income != null
                              ? formatTaka(Number(profile.monthly_income))
                              : "—"
                          }
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
