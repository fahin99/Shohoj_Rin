import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { DataTable, type Column } from '../components/DataTable';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Tabs, TabPanel } from '../components/Tabs';
import { Alert } from '../components/Alert';
import { formatTaka, formatDate } from '../lib/format';
import type { PageName } from '../types';
import { getDisplayName, useStoredUser } from '../lib/session';

interface Props {
  onNavigate: (page: PageName) => void;
}

interface PendingApplication {
  id: string;
  applicant: string;
  product: string;
  amount: number;
  submitted: string;
  riskScore: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'approved' | 'rejected';
}

const initialQueue: PendingApplication[] = [
  { id: 'APP-9210', applicant: 'Farhana Akter', product: 'Student Tuition Support Loan', amount: 180000, submitted: '2026-07-18', riskScore: 'Low', status: 'pending' },
  { id: 'APP-9198', applicant: 'Mizanur Rahman', product: 'Small Business Working Capital Facility', amount: 500000, submitted: '2026-07-17', riskScore: 'Medium', status: 'pending' },
  { id: 'APP-9187', applicant: 'Shirin Sultana', product: 'Emergency Medical Assistance', amount: 75000, submitted: '2026-07-17', riskScore: 'Low', status: 'pending' },
  { id: 'APP-9172', applicant: 'Kamal Hossain', product: 'Personal Flexible Loan', amount: 220000, submitted: '2026-07-16', riskScore: 'High', status: 'pending' },
  { id: 'APP-9165', applicant: 'Nusrat Jahan Mim', product: 'Rural Entrepreneur Growth Loan', amount: 320000, submitted: '2026-07-15', riskScore: 'Medium', status: 'pending' },
];

const users = [
  { id: 'U-2201', name: 'Riya Ahmed', role: 'Borrower', joined: '2025-09-28', status: 'active' as const },
  { id: 'U-1987', name: 'Tanvir Hossain', role: 'Lender', joined: '2025-06-10', status: 'active' as const },
  { id: 'U-2044', name: 'Sabbir Ahmed', role: 'Borrower', joined: '2025-11-02', status: 'suspended' as const },
];

const providers = [
  { id: 'P-01', name: 'Bengal Microfinance Bank', products: 2, activeLoans: 340, status: 'active' as const },
  { id: 'P-02', name: 'Shohoj Care Finance', products: 1, activeLoans: 120, status: 'active' as const },
  { id: 'P-03', name: 'Dhaka Trade Credit', products: 1, activeLoans: 88, status: 'under-review' as const },
];

export default function AdminDashboard({ onNavigate }: Props) {
  const { user } = useStoredUser();
  const [queue, setQueue] = useState<PendingApplication[]>(initialQueue);
  const [confirmation, setConfirmation] = useState<{ type: 'approved' | 'rejected'; applicant: string } | null>(null);
  const [tab, setTab] = useState('applications');
  const userName = getDisplayName(user, 'Admin — Nusrat Jahan');

  const handleDecision = (id: string, decision: 'approved' | 'rejected') => {
    const app = queue.find((q) => q.id === id);
    if (!app) return;
    setQueue((prev) => prev.map((q) => (q.id === id ? { ...q, status: decision } : q)));
    setConfirmation({ type: decision, applicant: app.applicant });
  };

  const columns: Column<PendingApplication>[] = [
    { key: 'id', header: 'ID', render: (r) => <span className="font-mono-sr text-xs text-stone-500">{r.id}</span> },
    { key: 'applicant', header: 'Applicant', render: (r) => <span className="font-medium">{r.applicant}</span> },
    { key: 'product', header: 'Product', hideBelow: 'md', render: (r) => <span className="text-stone-500">{r.product}</span> },
    { key: 'amount', header: 'Amount', numeric: true, render: (r) => formatTaka(r.amount) },
    { key: 'submitted', header: 'Submitted', hideBelow: 'sm', render: (r) => formatDate(r.submitted) },
    {
      key: 'risk',
      header: 'Risk score',
      render: (r) => (
        <Badge variant={r.riskScore === 'Low' ? 'success' : r.riskScore === 'Medium' ? 'warning' : 'error'} size="sm" dot>
          {r.riskScore}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (r) =>
        r.status === 'pending' ? (
          <div className="flex items-center gap-2 justify-end">
            <Button variant="secondary" size="xs" onClick={() => handleDecision(r.id, 'rejected')}>Reject</Button>
            <Button variant="primary" size="xs" onClick={() => handleDecision(r.id, 'approved')}>Approve</Button>
          </div>
        ) : (
          <Badge variant={r.status === 'approved' ? 'success' : 'error'} size="sm">
            {r.status === 'approved' ? 'Approved' : 'Rejected'}
          </Badge>
        ),
    },
  ];

  const pendingCount = queue.filter((q) => q.status === 'pending').length;

  return (
    <AppLayout onNavigate={onNavigate} currentPage="admin" userType="admin" userName={userName}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          eyebrow="Platform overview"
          title="Admin dashboard"
          description="Monitor applications, users, providers, and platform health."
        />

        {confirmation && (
          <div className="mb-5">
            <Alert
              variant={confirmation.type === 'approved' ? 'success' : 'error'}
              title={confirmation.type === 'approved' ? 'Application approved' : 'Application rejected'}
              dismissible
            >
              {confirmation.applicant}'s application has been {confirmation.type}.
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard label="Applications today" value="27" hint="+4 vs yesterday" />
          <StatCard label="Pending review" value={String(pendingCount)} tone="attention" />
          <StatCard label="Approval rate" value="82%" tone="positive" />
          <StatCard label="Disbursed this month" value={formatTaka(9400000)} tone="info" />
          <StatCard label="Overdue accounts" value="18" tone="critical" />
        </div>

        <Tabs
          variant="card"
          className="mb-5"
          tabs={[
            { id: 'applications', label: 'Applications', count: pendingCount },
            { id: 'users', label: 'Users', count: users.length },
            { id: 'providers', label: 'Providers', count: providers.length },
          ]}
          activeTab={tab}
          onChange={setTab}
        />

        <TabPanel id="applications" activeTab={tab}>
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] mb-6">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between items-center px-5 py-4 border-b border-stone-200">
              <h2 className="text-sm font-semibold text-navy min-w-0">Review queue</h2>
              <span className="text-xs text-stone-500 shrink-0">{pendingCount} pending</span>
            </div>
            <DataTable caption="Pending applications" columns={columns} rows={queue} rowKey={(r) => r.id} />
          </div>
        </TabPanel>

        <TabPanel id="users" activeTab={tab}>
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] mb-6">
            <DataTable
              caption="Users"
              rowKey={(r) => r.id}
              rows={users}
              columns={[
                { key: 'name', header: 'Name', render: (r) => <span className="font-medium">{r.name}</span> },
                { key: 'role', header: 'Role', render: (r) => r.role },
                { key: 'joined', header: 'Joined', hideBelow: 'sm', render: (r) => formatDate(r.joined) },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'error'} size="sm" dot>{r.status}</Badge>,
                },
              ]}
            />
          </div>
        </TabPanel>

        <TabPanel id="providers" activeTab={tab}>
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] mb-6">
            <DataTable
              caption="Providers"
              rowKey={(r) => r.id}
              rows={providers}
              columns={[
                { key: 'name', header: 'Provider', render: (r) => <span className="font-medium">{r.name}</span> },
                { key: 'products', header: 'Products', numeric: true, render: (r) => r.products },
                { key: 'activeLoans', header: 'Active loans', numeric: true, render: (r) => r.activeLoans },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r) => <Badge variant={r.status === 'active' ? 'success' : 'warning'} size="sm" dot>{r.status === 'active' ? 'Active' : 'Under review'}</Badge>,
                },
              ]}
            />
          </div>
        </TabPanel>

        {/* System health */}
        <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5">
          <h2 className="text-sm font-semibold text-navy mb-4">System health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'API uptime', value: '99.98%', status: 'success' as const },
              { label: 'Payment gateway', value: 'Operational', status: 'success' as const },
              { label: 'Document verification queue', value: '3 delayed', status: 'warning' as const },
            ].map((item) => (
              <div key={item.label} className="border border-stone-200 rounded-[6px] p-3 flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <p className="text-xs text-stone-500">{item.label}</p>
                  <p className="text-sm font-medium text-navy mt-0.5 truncate">{item.value}</p>
                </div>
                <Badge variant={item.status} size="sm" dot>{item.status === 'success' ? 'OK' : 'Watch'}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
