import { AppLayout } from "../components/AppLayout";
import { Button } from "../components/Button";
import { Badge, LoanStatusBadge } from "../components/Badge";
import { ProgressBar } from "../components/Progress";
import { StatCard } from "../components/StatCard";
import { Card, CardBody, CardHeader } from "../components/Card";
import { activeLoan, applications, transactions } from "../lib/mock-data";
import { formatDate, formatPercent, formatTaka } from "../lib/format";
import type { PageName, Transaction } from "../types";
import { getDisplayName, type StoredUserProfile } from "../lib/session";

interface BorrowerDashboardProps {
  onNavigate: (page: PageName) => void;
  user: StoredUserProfile;
}

const quickActions: { label: string; page: PageName; icon: string }[] = [
  { label: "Explore loans", icon: "🔍", page: "loan-marketplace" },
  { label: "Make a payment", icon: "💳", page: "repayment" },
  { label: "Loan details", icon: "📋", page: "active-loan" },
  { label: "Learn finance", icon: "📚", page: "education" },
];

const txDirection: Record<Transaction["type"], "in" | "out"> = {
  repayment: "out",
  payment: "out",
  fee: "out",
  disbursement: "in",
  refund: "in",
};

function TransactionIcon({ type }: { type: Transaction["type"] }) {
  const icons: Record<Transaction["type"], { bg: string; icon: string }> = {
    repayment: { bg: "bg-emerald-light", icon: "↑" },
    disbursement: { bg: "bg-teal-light", icon: "↓" },
    fee: { bg: "bg-coral-light", icon: "−" },
    payment: { bg: "bg-sky-light", icon: "↑" },
    refund: { bg: "bg-emerald-light", icon: "↩" },
  };
  const cfg = icons[type];
  return (
    <span
      aria-hidden="true"
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold text-stone-600 ${cfg.bg}`}
    >
      {cfg.icon}
    </span>
  );
}

export default function BorrowerDashboard({ onNavigate, user }: BorrowerDashboardProps) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const openApplications = applications.filter(
    (a) => a.status === "under-review" || a.status === "info-required",
  );
  const userName = getDisplayName(user, "Riya Ahmed");
  const firstName = userName.split(" ")[0] ?? userName;

  return (
    <AppLayout
      onNavigate={onNavigate}
      currentPage="borrower-dashboard"
      userType="borrower"
      userName={userName}
    >
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
        <header className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold text-navy">
              {greeting}, {firstName}
            </h1>
            <p className="mt-0.5 text-sm text-stone-500">
              {now.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => onNavigate("loan-marketplace")}>
            Apply for a loan
          </Button>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Remaining balance"
            value={formatTaka(activeLoan.remainingBalance)}
            hint="Student Tuition Support Loan"
          />
          <StatCard
            label="Next repayment"
            value={formatTaka(activeLoan.monthlyPayment)}
            hint={`Due ${formatDate(activeLoan.nextPaymentDate)}`}
            tone="attention"
          />
          <StatCard
            label="Total repaid"
            value={formatTaka(activeLoan.amountRepaid)}
            hint={`${activeLoan.paidMonths} of ${activeLoan.durationMonths} instalments`}
            tone="positive"
          />
          <StatCard
            label="Applications"
            value={String(applications.length)}
            hint={`${openApplications.length} awaiting a decision`}
            tone="info"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="flex min-w-0 flex-col gap-5 lg:col-span-2">
            {/* Emphasis card: the one neubrutalist moment on this page. */}
            <section className="min-w-0 rounded-[8px] border-[1.5px] border-navy bg-white p-4 shadow-nb sm:p-5">
              <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                    Active loan
                  </p>
                  <h2 className="mt-0.5 text-base font-semibold leading-snug text-navy">
                    {activeLoan.name}
                  </h2>
                  <p className="mt-0.5 tabular-nums text-xs text-stone-500">{activeLoan.id}</p>
                </div>
                <LoanStatusBadge status="active" />
              </div>

              <dl className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="min-w-0">
                  <dt className="text-xs text-stone-500">Amount borrowed</dt>
                  <dd className="mt-0.5 tabular-nums font-semibold text-navy">
                    {formatTaka(activeLoan.principal)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-stone-500">Remaining balance</dt>
                  <dd className="mt-0.5 tabular-nums font-semibold text-navy">
                    {formatTaka(activeLoan.remainingBalance)}
                  </dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-stone-500">Interest rate</dt>
                  <dd className="mt-0.5 tabular-nums font-semibold text-navy">
                    {formatPercent(activeLoan.interestRate)}
                  </dd>
                </div>
              </dl>

              <ProgressBar
                value={activeLoan.paidMonths}
                max={activeLoan.durationMonths}
                label={`Repayment progress — ${activeLoan.paidMonths} of ${activeLoan.durationMonths} months`}
                showValue
                size="lg"
                color="teal"
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4">
                <p className="min-w-0 text-xs text-stone-500">
                  Next payment {formatDate(activeLoan.nextPaymentDate)} —{" "}
                  <span className="tabular-nums font-medium text-navy">
                    {formatTaka(activeLoan.monthlyPayment)}
                  </span>
                </p>
                <Button variant="tertiary" size="sm" onClick={() => onNavigate("active-loan")}>
                  View loan details
                </Button>
              </div>
            </section>

            <Card>
              <CardHeader
                title="Recent transactions"
                action={
                  <Button variant="ghost" size="sm" onClick={() => onNavigate("active-loan")}>
                    See all
                  </Button>
                }
              />
              <ul className="divide-y divide-stone-100">
                {transactions.slice(0, 5).map((tx) => {
                  const out = txDirection[tx.type] === "out";
                  return (
                    <li key={tx.id} className="flex min-w-0 items-center gap-3 px-4 py-3 sm:px-5">
                      <TransactionIcon type={tx.type} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-snug text-navy">
                          {tx.description}
                        </p>
                        <p className="mt-0.5 text-xs text-stone-500">{formatDate(tx.date)}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span
                          className={`tabular-nums text-sm font-semibold ${out ? "text-navy" : "text-emerald"}`}
                        >
                          {out ? "−" : "+"}
                          {formatTaka(Math.abs(tx.amount))}
                        </span>
                        <Badge
                          variant={
                            tx.status === "completed"
                              ? "success"
                              : tx.status === "failed"
                                ? "error"
                                : "warning"
                          }
                          size="sm"
                        >
                          {tx.status === "completed"
                            ? "Completed"
                            : tx.status === "failed"
                              ? "Failed"
                              : "Pending"}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <Card>
              <CardHeader title="Quick actions" />
              <CardBody>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action) => (
                    <button
                      key={action.label}
                      type="button"
                      onClick={() => onNavigate(action.page)}
                      className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-[6px] border border-stone-200 p-3 text-center text-xs font-medium text-stone-600 transition-all hover:border-navy hover:text-navy hover:shadow-nb-xs"
                    >
                      <span aria-hidden="true" className="text-xl">
                        {action.icon}
                      </span>
                      {action.label}
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title="Applications"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate("application-status")}
                  >
                    View all
                  </Button>
                }
              />
              <CardBody className="flex flex-col gap-2">
                {applications.slice(0, 3).map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => onNavigate("application-status")}
                    className="w-full rounded-[6px] border border-stone-200 p-3 text-left transition-colors hover:border-stone-300 hover:bg-stone-50"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-snug text-navy">{app.product}</p>
                        <p className="mt-0.5 tabular-nums text-xs text-stone-500">{app.id}</p>
                      </div>
                      <Badge
                        variant={
                          app.status === "disbursed"
                            ? "teal"
                            : app.status === "rejected"
                              ? "error"
                              : "warning"
                        }
                        size="sm"
                        dot
                      >
                        {app.status === "under-review"
                          ? "In review"
                          : app.status === "info-required"
                            ? "Info needed"
                            : app.status === "disbursed"
                              ? "Disbursed"
                              : "Rejected"}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-stone-500">
                      {formatTaka(app.amount)} · submitted {formatDate(app.submitted)}
                    </p>
                  </button>
                ))}
              </CardBody>
            </Card>

            <section className="rounded-[8px] border-[1.5px] border-yellow bg-yellow-light p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-yellow-dark">
                Upcoming payment
              </p>
              <p className="font-display tabular-nums text-2xl font-semibold text-navy">
                {formatTaka(activeLoan.monthlyPayment)}
              </p>
              <p className="mt-0.5 text-xs text-stone-600">
                Due {formatDate(activeLoan.nextPaymentDate)}
              </p>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                className="mt-3"
                onClick={() => onNavigate("repayment")}
              >
                Pay now
              </Button>
            </section>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
