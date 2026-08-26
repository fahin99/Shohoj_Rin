import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { PageHeader } from '../components/PageHeader';
import { Card, CardHeader, CardBody, DataRow } from '../components/Card';
import { StatCard } from '../components/StatCard';
import { Badge, LoanStatusBadge } from '../components/Badge';
import { Tabs, TabPanel } from '../components/Tabs';
import { ProgressBar } from '../components/Progress';
import { Button } from '../components/Button';
import { DataTable } from '../components/DataTable';
import { EmptyState, EmptyIcons } from '../components/EmptyState';
import { activeLoan, repaymentSchedule, transactions } from '../lib/mock-data';
import { formatTaka, formatPercent, formatDate } from '../lib/format';
import type { PageName, RepaymentScheduleRow, Transaction } from '../types';
interface Props {
  onNavigate: (page: PageName) => void;
}
const scheduleStatusVariant: Record<RepaymentScheduleRow['status'], 'success' | 'warning' | 'error' | 'neutral'> = {
  paid: 'success',
  due: 'warning',
  upcoming: 'neutral',
  overdue: 'error',
};
const scheduleStatusLabel: Record<RepaymentScheduleRow['status'], string> = {
  paid: 'Paid',
  due: 'Due',
  upcoming: 'Upcoming',
  overdue: 'Overdue',
};
const txTypeLabel: Record<Transaction['type'], string> = {
  repayment: 'Repayment',
  disbursement: 'Disbursement',
  fee: 'Fee',
  payment: 'Payment',
  refund: 'Refund',
};
const txStatusVariant: Record<Transaction['status'], 'success' | 'warning' | 'error'> = {
  completed: 'success',
  pending: 'warning',
  failed: 'error',
};
export default function ActiveLoanDetails({ onNavigate }: Props) {
  const [tab, setTab] = useState<'schedule' | 'transactions'>('schedule');

  if (!activeLoan) {
    return (
      <AppLayout onNavigate={onNavigate} currentPage="active-loan">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
          <PageHeader
            eyebrow="My loans"
            title="Active loan details"
            description="View your active loan schedule, interest breakdown, and payment history."
          />
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px]">
            <EmptyState
              icon={EmptyIcons.loans}
              title="No active loans yet"
              description="You do not currently have any active loans. Explore loan options and apply online in minutes."
              action={{ label: 'Explore loans', onClick: () => onNavigate('loan-marketplace') }}
              secondaryAction={{ label: 'Learn more', onClick: () => onNavigate('education') }}
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
            <p className="text-xs font-semibold uppercase tracking-widest text-teal mb-1">Loan {activeLoan.id}</p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-navy truncate">{activeLoan.name}</h1>
            <p className="text-sm text-stone-500 mt-1">{activeLoan.provider}</p>
          </div>
          <div className="shrink-0 flex items-start">
            <LoanStatusBadge status="active" />
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Principal" value={formatTaka(activeLoan.principal)} hint="Original amount borrowed" />
          <StatCard label="Repaid" value={formatTaka(activeLoan.amountRepaid)} tone="positive" hint={`${activeLoan.paidMonths} of ${activeLoan.durationMonths} instalments`} />
          <StatCard label="Remaining balance" value={formatTaka(activeLoan.remainingBalance)} tone="attention" />
          <StatCard label="Next payment" value={formatTaka(activeLoan.monthlyPayment)} tone="info" hint={`Due ${formatDate(activeLoan.nextPaymentDate)}`} />
        </div>
        <Card variant="raised" className="p-5 mb-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between sm:items-center mb-4">
            <h2 className="text-base font-semibold text-navy">Repayment progress</h2>
            <p className="text-sm text-stone-500 shrink-0">
              <span className="tabular-nums font-medium text-navy">{activeLoan.paidMonths}</span> / {activeLoan.durationMonths} months paid
            </p>
          </div>
          <ProgressBar value={activeLoan.paidMonths} max={activeLoan.durationMonths} showValue size="lg" color="teal" />
          <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-stone-100">
            <p className="text-sm text-stone-500">
              Next due date: <span className="tabular-nums text-navy font-medium">{formatDate(activeLoan.nextPaymentDate)}</span> · {remaining} months remaining
            </p>
            <Button variant="primary" size="sm" onClick={() => onNavigate('repayment')}>Make a payment</Button>
          </div>
        </Card>
        <Card variant="plain" className="mb-6">
          <CardHeader title="Cost breakdown" description="How your total repayment is made up" />
          <CardBody>
            <DataRow label="Principal" value={formatTaka(activeLoan.principal)} />
            <DataRow label="Interest rate" value={formatPercent(activeLoan.interestRate)} />
            <DataRow label="Interest paid to date" value={formatTaka(activeLoan.interestPaid)} />
            <DataRow label="Fees paid" value={formatTaka(activeLoan.feesPaid)} />
            <DataRow label="Total repayable" value={formatTaka(activeLoan.totalRepayable)} emphasis />
            <DataRow label="Total paid so far" value={formatTaka(activeLoan.amountRepaid)} />
            <DataRow label="Remaining balance" value={formatTaka(activeLoan.remainingBalance)} emphasis />
          </CardBody>
        </Card>
        <Card variant="plain" className="mb-6">
          <div className="px-4 sm:px-5 pt-4">
            <Tabs
              tabs={[
                { id: 'schedule', label: 'Repayment schedule', count: repaymentSchedule.length },
                { id: 'transactions', label: 'Transaction history', count: transactions.length },
              ]}
              activeTab={tab}
              onChange={(id) => setTab(id as typeof tab)}
            />
          </div>
          <TabPanel id="schedule" activeTab={tab}>
            <DataTable
              caption="Repayment schedule"
              rows={repaymentSchedule}
              rowKey={(r) => String(r.month)}
              columns={[
                { key: 'month', header: 'Month', render: (r) => r.month },
                { key: 'due', header: 'Due date', render: (r) => formatDate(r.dueDate) },
                { key: 'principal', header: 'Principal', numeric: true, hideBelow: 'sm', render: (r) => formatTaka(r.principal) },
                { key: 'interest', header: 'Interest', numeric: true, hideBelow: 'sm', render: (r) => formatTaka(r.interest) },
                { key: 'total', header: 'Total', numeric: true, render: (r) => formatTaka(r.total) },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => (
                    <div className="flex items-center gap-2 justify-end">
                      <Badge variant={scheduleStatusVariant[r.status]} size="sm" dot>{scheduleStatusLabel[r.status]}</Badge>
                      {r.status === 'due' && (
                        <Button variant="tertiary" size="xs" onClick={() => onNavigate('repayment')}>Pay now</Button>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </TabPanel>
          <TabPanel id="transactions" activeTab={tab}>
            <DataTable
              caption="Transaction history"
              rows={transactions}
              rowKey={(t) => t.id}
              columns={[
                { key: 'date', header: 'Date', render: (t) => formatDate(t.date) },
                { key: 'desc', header: 'Description', render: (t) => <span className="block min-w-0 truncate max-w-[220px]">{t.description}</span> },
                { key: 'type', header: 'Type', hideBelow: 'sm', render: (t) => <Badge variant="neutral" size="sm">{txTypeLabel[t.type]}</Badge> },
                {
                  key: 'amount',
                  header: 'Amount',
                  numeric: true,
                  render: (t) => (
                    <span className={t.type === 'disbursement' || t.type === 'refund' ? 'text-emerald' : 'text-coral'}>
                      {t.type === 'disbursement' || t.type === 'refund' ? '+' : '−'}{formatTaka(Math.abs(t.amount))}
                    </span>
                  ),
                },
                { key: 'status', header: 'Status', render: (t) => <Badge variant={txStatusVariant[t.status]} size="sm" dot>{t.status}</Badge> },
              ]}
            />
          </TabPanel>
        </Card>
        <Card variant="plain" className="p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between sm:items-center">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-navy">Loan agreement</h2>
              <p className="text-xs text-stone-500 mt-0.5">Signed agreement and disclosure documents for {activeLoan.id}.</p>
            </div>
            <Button variant="secondary" size="sm" className="shrink-0">Download PDF</Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
