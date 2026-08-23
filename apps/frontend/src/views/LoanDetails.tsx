import { useMemo, useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { Card, CardHeader, CardBody, DataRow } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { CurrencyInput, Select } from '../components/Input';
import { DataTable } from '../components/DataTable';
import { formatPercent, formatTaka, formatDate } from '../lib/format';
import { loanProducts, repaymentSchedule } from '../lib/mock-data';
import type { PageName, RepaymentScheduleRow } from '../types';
interface Props {
  onNavigate: (page: PageName) => void;
}
const categoryLabel: Record<string, string> = {
  education: 'Education',
  emergency: 'Emergency',
  business: 'Small business',
  personal: 'Personal',
  development: 'Development',
};
const fees = [
  { label: 'Processing fee', value: '1% of loan amount (one-time)' },
  { label: 'Late payment fee', value: '৳250 per missed instalment' },
  { label: 'Prepayment fee', value: 'None — repay early at any time' },
];
function calculateEmi(principal: number, annualRate: number, months: number) {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return principal / months;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return emi;
}
export default function LoanDetails({ onNavigate }: Props) {
  const loan = loanProducts[0];
  const [amount, setAmount] = useState(loan.maxAmount / 2);
  const [duration, setDuration] = useState(String(loan.durationMonths));
  const durationOptions = [12, 24, 36, 48].filter((d) => d <= loan.durationMonths).map((d) => ({
    value: String(d),
    label: `${d} months`,
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
  const previewRows = repaymentSchedule.slice(0, 6);
  const columns = [
    { key: 'month', header: 'Month', render: (r: RepaymentScheduleRow) => `#${r.month}` },
    { key: 'dueDate', header: 'Due date', render: (r: RepaymentScheduleRow) => formatDate(r.dueDate) },
    { key: 'principal', header: 'Principal', numeric: true, render: (r: RepaymentScheduleRow) => formatTaka(r.principal) },
    { key: 'interest', header: 'Interest', numeric: true, render: (r: RepaymentScheduleRow) => formatTaka(r.interest) },
    { key: 'total', header: 'Total', numeric: true, render: (r: RepaymentScheduleRow) => formatTaka(r.total) },
    {
      key: 'status',
      header: 'Status',
      render: (r: RepaymentScheduleRow) => (
        <Badge
          size="sm"
          variant={r.status === 'paid' ? 'success' : r.status === 'overdue' ? 'error' : r.status === 'due' ? 'warning' : 'neutral'}
        >
          {r.status}
        </Badge>
      ),
    },
  ];
  return (
    <AppLayout onNavigate={onNavigate} currentPage="loan-marketplace">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <button
          type="button"
          onClick={() => onNavigate('loan-marketplace')}
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal hover:underline"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to marketplace
        </button>
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="info" size="sm">{categoryLabel[loan.category]}</Badge>
              {loan.tags.map((t) => (
                <Badge key={t} variant="neutral" size="sm">{t}</Badge>
              ))}
            </div>
            <h1 className="text-2xl font-semibold text-navy sm:text-3xl">{loan.name}</h1>
            <p className="mt-1 text-sm text-stone-500">{loan.provider}</p>
          </div>
        </div>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-6">
          {}
          <div className="flex flex-col gap-5 min-w-0">
            <Card>
              <CardHeader title="About this loan" />
              <CardBody>
                <p className="text-sm leading-relaxed text-stone-600">{loan.description}</p>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Key facts" />
              <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="min-w-0">
                    <p className="text-xs text-stone-500">Interest rate</p>
                    <p className="tabular-nums text-base font-semibold text-navy mt-0.5">{formatPercent(loan.interestRate)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-stone-500">Loan range</p>
                    <p className="tabular-nums text-base font-semibold text-navy mt-0.5">{formatTaka(loan.minAmount)}–{formatTaka(loan.maxAmount)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-stone-500">Tenure</p>
                    <p className="tabular-nums text-base font-semibold text-navy mt-0.5">Up to {loan.durationMonths} months</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-stone-500">Provider</p>
                    <p className="text-base font-semibold text-navy mt-0.5 truncate">{loan.provider}</p>
                  </div>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Eligibility" description="You should meet all of the following before applying." />
              <CardBody>
                <ul className="flex flex-col gap-2.5">
                  {loan.eligibility.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-stone-600">
                      <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-light text-emerald flex items-center justify-center">
                        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                          <path d="M1 3.5L3.5 6L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <span className="min-w-0">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="What you'll repay" description="A plain-language breakdown based on your selection." />
              <CardBody>
                <DataRow label="Loan amount" value={formatTaka(amount)} />
                <DataRow label="Interest rate" value={formatPercent(loan.interestRate)} />
                <DataRow label="Repayment period" value={`${duration} months`} />
                <div className="border-t border-stone-200 mt-2 pt-2">
                  <DataRow label="Total interest payable" value={formatTaka(Math.round(totalInterest))} />
                  <DataRow label="Total repayment amount" value={formatTaka(Math.round(totalRepayment))} emphasis />
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Sample repayment schedule" description="First 6 of your monthly instalments." />
              <DataTable
                caption="Sample repayment schedule"
                columns={columns}
                rows={previewRows}
                rowKey={(r) => String(r.month)}
              />
            </Card>
            <Card>
              <CardHeader title="Fees & charges" />
              <CardBody>
                {fees.map((f) => (
                  <DataRow key={f.label} label={f.label} value={f.value} />
                ))}
              </CardBody>
            </Card>
          </div>
          {}
          <div className="min-w-0">
            <div className="lg:sticky lg:top-6">
              <Card variant="raised">
                <CardHeader title="Estimate your loan" />
                <CardBody>
                  <div className="flex flex-col gap-4">
                    <CurrencyInput
                      label="Loan amount"
                      value={amount}
                      min={loan.minAmount}
                      max={loan.maxAmount}
                      step={1000}
                      onChange={(e) => setAmount(Number(e.target.value) || loan.minAmount)}
                      hint={`Between ${formatTaka(loan.minAmount)} and ${formatTaka(loan.maxAmount)}`}
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
                      label="Repayment duration"
                      options={durationOptions}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                    <div className="border-t border-stone-200 pt-4 flex flex-col gap-1">
                      <DataRow label="Estimated monthly EMI" value={formatTaka(Math.round(emi))} emphasis />
                      <DataRow label="Total interest" value={formatTaka(Math.round(totalInterest))} />
                      <DataRow label="Total repayment" value={formatTaka(Math.round(totalRepayment))} />
                    </div>
                    <Button variant="primary" fullWidth onClick={() => onNavigate('loan-application')}>
                      Apply for this loan
                    </Button>
                    <p className="text-xs text-stone-400 text-center">
                      This is an estimate. Final terms are confirmed after your application is reviewed.
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
