import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { PageHeader } from '../components/PageHeader';
import { Card, CardBody } from '../components/Card';
import { Tabs } from '../components/Tabs';
import { Badge, AppStatusBadge } from '../components/Badge';
import { Alert } from '../components/Alert';
import { EmptyState, EmptyIcons } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { Stepper } from '../components/Progress';
import { applications } from '../lib/mock-data';
import { formatTaka, formatDate } from '../lib/format';
import type { PageName, AppStatus } from '../types';
interface Props {
  onNavigate: (page: PageName) => void;
}
type FilterId = 'all' | 'in-progress' | 'approved' | 'rejected';
const stageLabels = ['Submitted', 'Under review', 'Decision', 'Disbursed'];
function matchesFilter(status: AppStatus, filter: FilterId) {
  if (filter === 'all') return true;
  if (filter === 'approved') return status === 'approved' || status === 'disbursed';
  if (filter === 'rejected') return status === 'rejected';
  return status === 'submitted' || status === 'under-review' || status === 'info-required';
}
function timelineFor(app: (typeof applications)[number]) {
  const steps = [
    { label: 'Application submitted', date: formatDate(app.submitted), done: true },
    { label: 'Under review by ' + app.provider, date: app.stage >= 2 ? 'In progress' : 'Pending', done: app.stage >= 2 },
    {
      label: app.status === 'rejected' ? 'Application rejected' : 'Decision made',
      date: app.stage >= 3 ? 'Completed' : 'Pending',
      done: app.stage >= 3,
    },
    { label: 'Funds disbursed', date: app.stage >= 4 ? 'Completed' : 'Pending', done: app.stage >= 4 },
  ];
  return steps;
}
export default function ApplicationStatus({ onNavigate }: Props) {
  const [filter, setFilter] = useState<FilterId>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filtered = applications.filter((a) => matchesFilter(a.status, filter));
  const selected = applications.find((a) => a.id === selectedId) ?? null;
  return (
    <AppLayout onNavigate={onNavigate} currentPage="application-status">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          title="My applications"
          description="Track every loan application from submission to disbursement."
          actions={<Button variant="primary" size="sm" onClick={() => onNavigate('loan-marketplace')}>+ New application</Button>}
        />
        <Tabs
          className="mb-5"
          variant="pill"
          tabs={[
            { id: 'all', label: 'All', count: applications.length },
            { id: 'in-progress', label: 'In progress', count: applications.filter((a) => matchesFilter(a.status, 'in-progress')).length },
            { id: 'approved', label: 'Approved', count: applications.filter((a) => matchesFilter(a.status, 'approved')).length },
            { id: 'rejected', label: 'Rejected', count: applications.filter((a) => matchesFilter(a.status, 'rejected')).length },
          ]}
          activeTab={filter}
          onChange={(id) => setFilter(id as FilterId)}
        />
        {filtered.length === 0 ? (
          <Card variant="plain">
            <EmptyState
              icon={EmptyIcons.search}
              title="No applications here"
              description="Try a different filter, or start a new loan application."
              action={{ label: 'Explore loans', onClick: () => onNavigate('loan-marketplace') }}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((app) => (
              <Card key={app.id} variant="plain" className="p-4 sm:p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between sm:items-start">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-navy truncate">{app.product}</p>
                    <p className="text-sm text-stone-500 truncate">{app.provider}</p>
                    <p className="text-xs tabular-nums text-stone-400 mt-1">{app.id} · Submitted {formatDate(app.submitted)}</p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <AppStatusBadge status={app.status} />
                    <p className="tabular-nums text-sm font-semibold text-navy">{formatTaka(app.amount)}</p>
                  </div>
                </div>
                {app.status === 'info-required' && (
                  <Alert variant="warning" title="Additional information needed" className="mt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                      <span>{app.provider} needs an updated bank statement to continue reviewing this application.</span>
                      <Button variant="secondary" size="xs" className="shrink-0" onClick={() => setSelectedId(app.id)}>
                        Submit documents
                      </Button>
                    </div>
                  </Alert>
                )}
                <div className="mt-5 overflow-x-auto">
                  <Stepper steps={stageLabels.map((l) => ({ label: l }))} currentStep={app.stage - 1} />
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-teal hover:underline"
                    onClick={() => setSelectedId(app.id)}
                  >
                    View timeline
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
        <Modal
          open={!!selected}
          onClose={() => setSelectedId(null)}
          title={selected ? `${selected.product} — timeline` : ''}
          footer={<Button variant="secondary" size="sm" onClick={() => setSelectedId(null)}>Close</Button>}
        >
          {selected && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-stone-500">{selected.provider}</p>
                  <p className="text-sm tabular-nums text-stone-400">{selected.id}</p>
                </div>
                <AppStatusBadge status={selected.status} />
              </div>
              <ol className="flex flex-col gap-3">
                {timelineFor(selected).map((step, i) => (
                  <li key={i} className="flex items-start gap-3" aria-current={!step.done && i === selected.stage - 1 ? 'step' : undefined}>
                    <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${step.done ? 'bg-teal' : 'bg-stone-300'}`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-medium ${step.done ? 'text-navy' : 'text-stone-400'}`}>{step.label}</p>
                      <p className="text-xs text-stone-400">{step.date}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
