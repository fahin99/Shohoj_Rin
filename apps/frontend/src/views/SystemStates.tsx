import { useState } from "react";
import { AppLayout } from "../components/AppLayout";
import { PageHeader } from "../components/PageHeader";
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonRow,
  SkeletonDashboard,
} from "../components/Skeleton";
import { EmptyState, EmptyIcons } from "../components/EmptyState";
import { Alert } from "../components/Alert";
import { Button, IconButton } from "../components/Button";
import { Badge, LoanStatusBadge, AppStatusBadge } from "../components/Badge";
import { TextInput, CurrencyInput } from "../components/Input";
import type { PageName, LoanStatus, AppStatus } from "../types";
interface Props {
  onNavigate: (page: PageName) => void;
}
function Section({
  title,
  caption,
  children,
}: {
  title: string;
  caption?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        {caption && <p className="text-sm text-stone-500 mt-1 max-w-2xl">{caption}</p>}
      </div>
      {children}
    </section>
  );
}
const loanStatuses: LoanStatus[] = ["active", "completed", "overdue", "delinquent", "defaulted"];
const appStatuses: AppStatus[] = [
  "submitted",
  "under-review",
  "info-required",
  "approved",
  "rejected",
  "disbursed",
];
export default function SystemStates({ onNavigate }: Props) {
  const [retryCount, setRetryCount] = useState(0);
  return (
    <AppLayout onNavigate={onNavigate} currentPage="system-states">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          eyebrow="Design system"
          title="System states reference"
          description="A gallery of loading, empty, error, success, and component states used across Shohoj Rin."
        />
        {}
        <Section
          title="Loading states"
          caption="Skeletons communicate structure while data loads. Never use spinners alone for content-heavy areas."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5">
              <p className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wide">
                Skeleton card
              </p>
              <SkeletonCard />
            </div>
            <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5">
              <p className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wide">
                Skeleton rows
              </p>
              <div className="flex flex-col">
                {Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonRow key={i} />
                ))}
              </div>
            </div>
            <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5">
              <p className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wide">
                Skeleton text + block
              </p>
              <div className="flex flex-col gap-3">
                <Skeleton className="h-24 w-full" />
                <SkeletonText lines={3} />
              </div>
            </div>
            <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5">
              <p className="text-xs font-medium text-stone-500 mb-3 uppercase tracking-wide">
                Skeleton dashboard
              </p>
              <SkeletonDashboard />
            </div>
          </div>
        </Section>
        {}
        <Section
          title="Empty state"
          caption="Used when a list or search has no results, with a clear next action."
        >
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px]">
            <EmptyState
              icon={EmptyIcons.loans}
              title="No active loans yet"
              description="Once you apply and get approved, your loans will appear here."
              action={{ label: "Explore loans", onClick: () => onNavigate("loan-marketplace") }}
              secondaryAction={{ label: "Learn more", onClick: () => onNavigate("education") }}
            />
          </div>
        </Section>
        {}
        <Section
          title="Error states"
          caption="Alerts communicate status without relying on colour alone — each carries an icon and label."
        >
          <div className="flex flex-col gap-3 mb-5">
            <Alert variant="info" title="Heads up">
              Your document verification is in progress and may take up to 24 hours.
            </Alert>
            <Alert variant="success" title="Success">
              Your repayment of ৳4,500 was received successfully.
            </Alert>
            <Alert variant="warning" title="Action needed">
              Your application is missing a guarantor NID copy.
            </Alert>
            <Alert variant="error" title="Something went wrong" dismissible>
              We couldn't process your payment. Please try again.
            </Alert>
          </div>
          <div className="bg-white border-[1.5px] border-coral/40 rounded-[8px] p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-[8px] bg-coral-light border border-coral/30 flex items-center justify-center text-coral mb-4">
              {EmptyIcons.error}
            </div>
            <h3 className="font-semibold text-navy mb-1">Failed to load your data</h3>
            <p className="text-sm text-stone-500 max-w-xs mb-4">
              There was a problem connecting to the server. Retried {retryCount} time
              {retryCount === 1 ? "" : "s"}.
            </p>
            <Button variant="secondary" size="sm" onClick={() => setRetryCount((c) => c + 1)}>
              Retry
            </Button>
          </div>
        </Section>
        {}
        <Section
          title="Other page states"
          caption="Full-page states for connectivity, missing routes, and access control."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-3">
                ⌁
              </div>
              <h3 className="font-semibold text-navy text-sm mb-1">You're offline</h3>
              <p className="text-xs text-stone-500 mb-3">
                Check your internet connection and try again.
              </p>
              <Badge variant="neutral" size="sm" dot>
                No connection
              </Badge>
            </div>
            <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5 flex flex-col items-center text-center">
              <p className="tabular-nums text-3xl font-semibold text-stone-300 mb-2">404</p>
              <h3 className="font-semibold text-navy text-sm mb-1">Page not found</h3>
              <p className="text-xs text-stone-500 mb-3">
                The page you're looking for doesn't exist.
              </p>
              <Button variant="tertiary" size="xs" onClick={() => onNavigate("landing")}>
                Back to home
              </Button>
            </div>
            <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-yellow-light border border-yellow/40 flex items-center justify-center text-stone-700 mb-3">
                ⛔
              </div>
              <h3 className="font-semibold text-navy text-sm mb-1">Permission denied</h3>
              <p className="text-xs text-stone-500 mb-3">
                You don't have access to view this page.
              </p>
              <Badge variant="warning" size="sm" dot>
                Restricted
              </Badge>
            </div>
          </div>
        </Section>
        {}
        <Section title="Buttons" caption="All variants, sizes, and interactive states.">
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="tertiary">Tertiary</Button>
              <Button variant="navy">Navy</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="xs">Extra small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
              <IconButton label="Add">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M7 1v12M1 7h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </IconButton>
            </div>
          </div>
        </Section>
        <Section
          title="Inputs"
          caption="Default, focus (try clicking), error, and disabled states."
        >
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextInput label="Default input" placeholder="Enter your name" />
            <TextInput
              label="Input with error"
              placeholder="Enter amount"
              error="This field is required"
            />
            <CurrencyInput label="Currency input" placeholder="0" />
            <TextInput label="Disabled input" placeholder="Not editable" disabled />
          </div>
        </Section>
        <Section
          title="Badges"
          caption="Status is always shown with a label and dot indicator, never colour alone."
        >
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5 flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success" dot>
                Success
              </Badge>
              <Badge variant="warning" dot>
                Warning
              </Badge>
              <Badge variant="error" dot>
                Error
              </Badge>
              <Badge variant="info" dot>
                Info
              </Badge>
              <Badge variant="neutral" dot>
                Neutral
              </Badge>
              <Badge variant="teal" dot>
                Teal
              </Badge>
              <Badge variant="sky" dot>
                Sky
              </Badge>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">
                Loan status badges
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {loanStatuses.map((s) => (
                  <LoanStatusBadge key={s} status={s} />
                ))}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-stone-500 mb-2 uppercase tracking-wide">
                Application status badges
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {appStatuses.map((s) => (
                  <AppStatusBadge key={s} status={s} />
                ))}
              </div>
            </div>
          </div>
        </Section>
      </div>
    </AppLayout>
  );
}
