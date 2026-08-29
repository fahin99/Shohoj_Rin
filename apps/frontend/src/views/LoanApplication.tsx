import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { Card, CardHeader, CardBody, DataRow } from "../components/Card";
import { Button } from "../components/Button";
import { Stepper } from "../components/Progress";
import { Alert } from "../components/Alert";
import { CurrencyInput, TextInput, Select, FileUpload, Textarea } from "../components/Input";
import { formatTaka } from "../lib/format";
import { loansApi, applicationsApi, documentsApi } from "../lib/api/index";
import type { PageName, LoanProduct } from "../types";

interface Props {
  onNavigate: (page: PageName) => void;
}

const steps = [
  { label: "Loan details" },
  { label: "Employment & income" },
  { label: "Documents" },
  { label: "Review & submit" },
];

const durationOptions = [12, 18, 24, 36, 48].map((d) => ({
  value: String(d),
  label: `${d} months`,
}));

const employmentOptions = [
  { value: "salaried", label: "Salaried" },
  { value: "self-employed", label: "Self-employed" },
  { value: "business-owner", label: "Business owner" },
  { value: "student", label: "Student" },
];

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
  incomeProofUploaded: boolean;
  addressProofUploaded: boolean;
}

export default function LoanApplication({ onNavigate }: Props) {
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

  const defaultLoan = loanProducts[0] || { id: "", maxAmount: 100000, minAmount: 1000, durationMonths: 12, interestRate: 10, name: "", provider: "" };

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>({
    loanId: "",
    amount: 0,
    duration: "",
    purpose: "",
    phone: "",
    employment: "",
    monthlyIncome: 0,
    incomeProofUploaded: false,
    addressProofUploaded: false,
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

  const handleFileUpload = async (type: string, files: FileList | null, key: keyof FormState) => {
    if (!files || files.length === 0) {
      update(key, false as FormState[typeof key]);
      return;
    }
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      try {
        await documentsApi.uploadDocument({
          documentType: type,
          fileName: file.name,
          mimeType: file.type,
          fileData: base64,
        });
        update(key, true as FormState[typeof key]);
      } catch (err) {
        console.error("Upload failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  function validateStep(current: number): boolean {
    const next: Record<string, string> = {};
    if (current === 0) {
      if (!form.amount || form.amount < selectedLoan.minAmount)
        next.amount = `Enter at least ${formatTaka(selectedLoan.minAmount)}`;
      if (form.amount > selectedLoan.maxAmount)
        next.amount = `Amount cannot exceed ${formatTaka(selectedLoan.maxAmount)}`;
      if (!form.duration) next.duration = "Select a repayment duration";
      if (!form.purpose.trim()) next.purpose = "Tell us what this loan is for";
    }
    if (current === 1) {
      if (!/^01\d{9}$/.test(form.phone.replace(/\s/g, "")))
        next.phone = "Enter a valid Bangladeshi mobile number";
      if (!form.employment) next.employment = "Select your employment type";
      if (!form.monthlyIncome || form.monthlyIncome <= 0)
        next.monthlyIncome = "Enter your monthly income";
    }
    if (current === 2) {
      if (!form.incomeProofUploaded) next.incomeProofUploaded = "Income proof is required";
      if (!form.addressProofUploaded) next.addressProofUploaded = "Address proof is required";
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
    try {
      await applicationsApi.createApplication({
        requestedAmount: form.amount,
        purpose: "personal",
        purposeDescription: form.purpose,
        productId: form.loanId,
      });
      onNavigate("application-status");
    } catch (e) {
      console.error("Submission failed", e);
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="loan-marketplace">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex justify-center items-center h-64">
          <p className="text-stone-500">Loading loan application...</p>
        </div>
      </AppLayout>
    );
  }

  const summary = (
    <Card variant="raised">
      <CardHeader title="Application summary" />
      <CardBody>
        <DataRow label="Loan product" value={selectedLoan.name || "—"} />
        <DataRow label="Requested amount" value={formatTaka(form.amount || 0)} />
        <DataRow
          label="Duration"
          value={`${form.duration || selectedLoan.durationMonths} months`}
        />
        <div className="border-t border-stone-200 mt-2 pt-2">
          <DataRow label="Estimated monthly EMI" value={formatTaka(Math.round(emi))} emphasis />
        </div>
      </CardBody>
    </Card>
  );
  return (
    <AppLayout onNavigate={onNavigate} currentPage="loan-marketplace">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-navy sm:text-3xl">Apply for a loan</h1>
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
                description={`Step ${step + 1} of ${steps.length}`}
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
                        label="Loan product"
                        required
                        options={loanProducts.map((l) => ({
                          value: l.id,
                          label: `${l.name} — ${l.provider}`,
                        }))}
                        value={form.loanId}
                        onChange={(e) => update("loanId", e.target.value)}
                      />
                      <CurrencyInput
                        label="Loan amount"
                        required
                        value={form.amount}
                        error={errors.amount}
                        min={selectedLoan.minAmount}
                        max={selectedLoan.maxAmount}
                        onChange={(e) => update("amount", Number(e.target.value))}
                        hint={`Between ${formatTaka(selectedLoan.minAmount)} and ${formatTaka(selectedLoan.maxAmount)}`}
                      />
                      <Select
                        label="Repayment duration"
                        required
                        options={durationOptions.filter(
                          (d) => Number(d.value) <= selectedLoan.durationMonths,
                        )}
                        placeholder="Select duration"
                        value={form.duration}
                        error={errors.duration}
                        onChange={(e) => update("duration", e.target.value)}
                      />
                      <Textarea
                        label="Purpose of loan"
                        required
                        placeholder="E.g. Tuition fees for spring semester"
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
                              Identity &amp; Address Verified
                            </p>
                            <p className="text-xs text-stone-600">
                              Your Full Name, National ID, NID photo, and Present Address are linked
                              from your onboarding profile.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-emerald bg-white px-2 py-0.5 rounded border border-emerald/20 shrink-0">
                          Profile KYC
                        </span>
                      </div>
                      <TextInput
                        label="Contact mobile number"
                        required
                        placeholder="01XXXXXXXXX"
                        value={form.phone}
                        error={errors.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        hint="For SMS updates regarding your loan application"
                      />
                      <Select
                        label="Employment type"
                        required
                        placeholder="Select employment type"
                        options={employmentOptions}
                        value={form.employment}
                        error={errors.employment}
                        onChange={(e) => update("employment", e.target.value)}
                      />
                      <CurrencyInput
                        label="Monthly income"
                        required
                        value={form.monthlyIncome || ""}
                        error={errors.monthlyIncome}
                        onChange={(e) => update("monthlyIncome", Number(e.target.value))}
                      />
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div className="bg-teal-light/50 border border-teal/20 rounded-[6px] p-3 flex items-center gap-2">
                        <span className="text-teal font-semibold text-xs">
                          ✓ NID photo verified
                        </span>
                        <span className="text-xs text-stone-500">
                          — Uploaded during onboarding. Only income and address proof needed below.
                        </span>
                      </div>
                      <Alert variant="info" title="Accepted formats">
                        Upload clear scans or photos (PDF, JPG, PNG) up to 5MB each.
                      </Alert>
                      <FileUpload
                        label="Income proof (salary slip or bank statement)"
                        error={errors.incomeProofUploaded}
                        onChange={(files) => handleFileUpload("income-proof", files, "incomeProofUploaded")}
                      />
                      <FileUpload
                        label="Address proof (utility bill)"
                        error={errors.addressProofUploaded}
                        onChange={(files) => handleFileUpload("address-proof", files, "addressProofUploaded")}
                      />
                    </>
                  )}
                  {step === 3 && (
                    <div className="flex flex-col gap-4">
                      <Alert variant="success" title="Ready to submit">
                        Please review your details below. You can go back to make changes before
                        submitting.
                      </Alert>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                          Loan details
                        </p>
                        <DataRow label="Loan product" value={selectedLoan.name} />
                        <DataRow label="Amount requested" value={formatTaka(form.amount)} />
                        <DataRow label="Duration" value={`${form.duration} months`} />
                        <DataRow label="Purpose" value={form.purpose || "—"} />
                      </div>
                      <div className="border-t border-stone-200 pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                          Identity &amp; employment
                        </p>
                        <DataRow label="Identity & NID" value="Verified from profile ✓" />
                        <DataRow label="Contact mobile" value={form.phone || "—"} />
                        <DataRow
                          label="Employment type"
                          value={
                            employmentOptions.find((o) => o.value === form.employment)?.label ?? "—"
                          }
                        />
                        <DataRow
                          label="Monthly income"
                          value={form.monthlyIncome ? formatTaka(form.monthlyIncome) : "—"}
                        />
                      </div>
                      <div className="border-t border-stone-200 pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                          Documents
                        </p>
                        <DataRow label="NID Card" value="Verified in profile ✓" />
                        <DataRow
                          label="Income proof"
                          value={form.incomeProofUploaded ? "Uploaded" : "Missing"}
                        />
                        <DataRow
                          label="Address proof"
                          value={form.addressProofUploaded ? "Uploaded" : "Missing"}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-5">
              <Button variant="secondary" onClick={handleBack} disabled={step === 0 || submitting}>
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button variant="primary" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button variant="primary" onClick={handleSubmit} loading={submitting}>
                  {submitting ? "Submitting…" : "Submit application"}
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
