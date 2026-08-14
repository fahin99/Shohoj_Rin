import { useMemo, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Card, CardHeader, CardBody, DataRow } from '../components/Card';
import { Button } from '../components/Button';
import { Stepper } from '../components/Progress';
import { Alert } from '../components/Alert';
import { CurrencyInput, TextInput, Select, FileUpload, Textarea } from '../components/Input';
import { formatTaka } from '../lib/format';
import { loanProducts } from '../lib/mock-data';
import type { PageName } from '../types';

interface Props {
  onNavigate: (page: PageName) => void;
}

const steps = [
  { label: 'Loan details' },
  { label: 'Personal & income' },
  { label: 'Documents' },
  { label: 'Review & submit' },
];

const durationOptions = [12, 18, 24, 36, 48].map((d) => ({ value: String(d), label: `${d} months` }));

const employmentOptions = [
  { value: 'salaried', label: 'Salaried' },
  { value: 'self-employed', label: 'Self-employed' },
  { value: 'business-owner', label: 'Business owner' },
  { value: 'student', label: 'Student' },
];

function calculateEmi(principal: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 12 / 100;
  if (!principal || !months) return 0;
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
}

interface FormState {
  loanId: string;
  amount: number;
  duration: string;
  purpose: string;
  fullName: string;
  nid: string;
  phone: string;
  address: string;
  employment: string;
  monthlyIncome: number;
  nidUploaded: boolean;
  incomeProofUploaded: boolean;
  addressProofUploaded: boolean;
}

export default function LoanApplication({ onNavigate }: Props) {
  const loan = loanProducts[0];
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<FormState>({
    loanId: loan.id,
    amount: Math.round(loan.maxAmount / 2),
    duration: String(loan.durationMonths),
    purpose: '',
    fullName: '',
    nid: '',
    phone: '',
    address: '',
    employment: '',
    monthlyIncome: 0,
    nidUploaded: false,
    incomeProofUploaded: false,
    addressProofUploaded: false,
  });

  const selectedLoan = loanProducts.find((l) => l.id === form.loanId) ?? loan;

  const emi = useMemo(
    () => calculateEmi(form.amount, selectedLoan.interestRate, Number(form.duration)),
    [form.amount, form.duration, selectedLoan]
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  }

  function validateStep(current: number): boolean {
    const next: Record<string, string> = {};
    if (current === 0) {
      if (!form.amount || form.amount < selectedLoan.minAmount) next.amount = `Enter at least ${formatTaka(selectedLoan.minAmount)}`;
      if (form.amount > selectedLoan.maxAmount) next.amount = `Amount cannot exceed ${formatTaka(selectedLoan.maxAmount)}`;
      if (!form.duration) next.duration = 'Select a repayment duration';
      if (!form.purpose.trim()) next.purpose = 'Tell us what this loan is for';
    }
    if (current === 1) {
      if (!form.fullName.trim()) next.fullName = 'Full name is required';
      if (!/^\d{10,17}$/.test(form.nid.replace(/\s/g, ''))) next.nid = 'Enter a valid NID number';
      if (!/^01\d{9}$/.test(form.phone.replace(/\s/g, ''))) next.phone = 'Enter a valid Bangladeshi mobile number';
      if (!form.address.trim()) next.address = 'Address is required';
      if (!form.employment) next.employment = 'Select your employment type';
      if (!form.monthlyIncome || form.monthlyIncome <= 0) next.monthlyIncome = 'Enter your monthly income';
    }
    if (current === 2) {
      if (!form.nidUploaded) next.nidUploaded = 'NID copy is required';
      if (!form.incomeProofUploaded) next.incomeProofUploaded = 'Income proof is required';
      if (!form.addressProofUploaded) next.addressProofUploaded = 'Address proof is required';
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

  function handleSubmit() {
    if (!validateStep(step)) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onNavigate('application-status');
    }, 1400);
  }

  const summary = (
    <Card variant="raised">
      <CardHeader title="Application summary" />
      <CardBody>
        <DataRow label="Loan product" value={selectedLoan.name} />
        <DataRow label="Requested amount" value={formatTaka(form.amount || 0)} />
        <DataRow label="Duration" value={`${form.duration || selectedLoan.durationMonths} months`} />
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
          <p className="mt-1.5 text-sm text-stone-500">{selectedLoan.name} — {selectedLoan.provider}</p>
        </div>

        <div className="mb-6 overflow-x-auto">
          <Stepper steps={steps} currentStep={step} />
        </div>

        {/* Mobile summary */}
        <div className="lg:hidden mb-5">{summary}</div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem] gap-6">
          <div className="min-w-0">
            <Card>
              <CardHeader title={steps[step].label} description={`Step ${step + 1} of ${steps.length}`} />
              <CardBody>
                <div role="group" aria-current="step" aria-label={steps[step].label} className="flex flex-col gap-4">
                  {step === 0 && (
                    <>
                      <Select
                        label="Loan product"
                        required
                        options={loanProducts.map((l) => ({ value: l.id, label: `${l.name} — ${l.provider}` }))}
                        value={form.loanId}
                        onChange={(e) => update('loanId', e.target.value)}
                      />
                      <CurrencyInput
                        label="Loan amount"
                        required
                        value={form.amount}
                        error={errors.amount}
                        min={selectedLoan.minAmount}
                        max={selectedLoan.maxAmount}
                        onChange={(e) => update('amount', Number(e.target.value))}
                        hint={`Between ${formatTaka(selectedLoan.minAmount)} and ${formatTaka(selectedLoan.maxAmount)}`}
                      />
                      <Select
                        label="Repayment duration"
                        required
                        options={durationOptions.filter((d) => Number(d.value) <= selectedLoan.durationMonths)}
                        placeholder="Select duration"
                        value={form.duration}
                        error={errors.duration}
                        onChange={(e) => update('duration', e.target.value)}
                      />
                      <Textarea
                        label="Purpose of loan"
                        required
                        placeholder="E.g. Tuition fees for spring semester"
                        value={form.purpose}
                        error={errors.purpose}
                        onChange={(e) => update('purpose', e.target.value)}
                      />
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <TextInput
                        label="Full name (as per NID)"
                        required
                        placeholder="Riya Ahmed"
                        value={form.fullName}
                        error={errors.fullName}
                        onChange={(e) => update('fullName', e.target.value)}
                      />
                      <TextInput
                        label="National ID (NID) number"
                        required
                        placeholder="1234567890123"
                        value={form.nid}
                        error={errors.nid}
                        onChange={(e) => update('nid', e.target.value)}
                      />
                      <TextInput
                        label="Mobile number"
                        required
                        placeholder="01XXXXXXXXX"
                        value={form.phone}
                        error={errors.phone}
                        onChange={(e) => update('phone', e.target.value)}
                      />
                      <Textarea
                        label="Present address"
                        required
                        placeholder="House, road, area, Dhaka"
                        value={form.address}
                        error={errors.address}
                        onChange={(e) => update('address', e.target.value)}
                      />
                      <Select
                        label="Employment type"
                        required
                        placeholder="Select employment type"
                        options={employmentOptions}
                        value={form.employment}
                        error={errors.employment}
                        onChange={(e) => update('employment', e.target.value)}
                      />
                      <CurrencyInput
                        label="Monthly income"
                        required
                        value={form.monthlyIncome || ''}
                        error={errors.monthlyIncome}
                        onChange={(e) => update('monthlyIncome', Number(e.target.value))}
                      />
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <Alert variant="info" title="Accepted formats">
                        Upload clear scans or photos (PDF, JPG, PNG) up to 5MB each.
                      </Alert>
                      <FileUpload
                        label="NID copy (front & back)"
                        error={errors.nidUploaded}
                        onChange={(files) => update('nidUploaded', !!files && files.length > 0)}
                      />
                      <FileUpload
                        label="Income proof (salary slip or bank statement)"
                        error={errors.incomeProofUploaded}
                        onChange={(files) => update('incomeProofUploaded', !!files && files.length > 0)}
                      />
                      <FileUpload
                        label="Address proof (utility bill)"
                        error={errors.addressProofUploaded}
                        onChange={(files) => update('addressProofUploaded', !!files && files.length > 0)}
                      />
                    </>
                  )}

                  {step === 3 && (
                    <div className="flex flex-col gap-4">
                      <Alert variant="success" title="Ready to submit">
                        Please review your details below. You can go back to make changes before submitting.
                      </Alert>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Loan details</p>
                        <DataRow label="Loan product" value={selectedLoan.name} />
                        <DataRow label="Amount requested" value={formatTaka(form.amount)} />
                        <DataRow label="Duration" value={`${form.duration} months`} />
                        <DataRow label="Purpose" value={form.purpose || '—'} />
                      </div>
                      <div className="border-t border-stone-200 pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Personal & income</p>
                        <DataRow label="Full name" value={form.fullName || '—'} />
                        <DataRow label="NID" value={form.nid || '—'} />
                        <DataRow label="Mobile number" value={form.phone || '—'} />
                        <DataRow label="Employment type" value={employmentOptions.find((o) => o.value === form.employment)?.label ?? '—'} />
                        <DataRow label="Monthly income" value={form.monthlyIncome ? formatTaka(form.monthlyIncome) : '—'} />
                      </div>
                      <div className="border-t border-stone-200 pt-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">Documents</p>
                        <DataRow label="NID copy" value={form.nidUploaded ? 'Uploaded' : 'Missing'} />
                        <DataRow label="Income proof" value={form.incomeProofUploaded ? 'Uploaded' : 'Missing'} />
                        <DataRow label="Address proof" value={form.addressProofUploaded ? 'Uploaded' : 'Missing'} />
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
                  {submitting ? 'Submitting…' : 'Submit application'}
                </Button>
              )}
            </div>
          </div>

          {/* Desktop summary */}
          <div className="hidden lg:block min-w-0">
            <div className="lg:sticky lg:top-6">{summary}</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
