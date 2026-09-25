"use client";
import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";
import { AppLayout } from "../components/AppLayout";
import { useCurrentUser } from "../lib/user-context";
import { PageHeader } from "../components/PageHeader";
import { Card } from "../components/Card";
import { Tabs } from "../components/Tabs";
import { AppStatusBadge } from "../components/Badge";
import { Alert } from "../components/Alert";
import { EmptyState, EmptyIcons } from "../components/EmptyState";
import { Modal } from "../components/Modal";
import { Button } from "../components/Button";
import { Stepper } from "../components/Progress";
import { applicationsApi } from "../lib/api/index";
import { formatTaka, formatDate } from "../lib/format";
import type { PageName, AppStatus } from "../types";

interface StoredApplication {
  id: string;
  referenceCode?: string;
  product: string;
  provider: string;
  amount: number;
  status: AppStatus;
  submitted: string;
  stage: number;
}

function statusToStage(status: string): number {
  switch (status) {
    case "submitted":
      return 1;
    case "under-review":
    case "under_review":
    case "info-required":
    case "info_required":
      return 2;
    case "approved":
    case "rejected":
      return 3;
    case "disbursed":
      return 4;
    default:
      return 1;
  }
}

interface Props {
  onNavigate: (page: PageName) => void;
}
type FilterId = "all" | "in-progress" | "approved" | "rejected";

function matchesFilter(status: AppStatus, filter: FilterId) {
  if (filter === "all") return true;
  if (filter === "approved") return status === "approved" || status === "disbursed";
  if (filter === "rejected") return status === "rejected";
  return (
    status === "submitted" ||
    status === "under-review" ||
    status === "under_review" ||
    status === "info-required" ||
    status === "info_required"
  );
}

export default function ApplicationStatus({ onNavigate }: Props) {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<StoredApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterId>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifiedAlert, setVerifiedAlert] = useState<boolean>(false);
  const currentUser = useCurrentUser();
  const currentUserRole = currentUser?.role;
  const isPrivilegedUser = currentUserRole === "lender" || currentUserRole === "admin";

  const fetchApplications = useCallback(async () => {
    try {
      const data = await applicationsApi.getApplications();
      const mapped = (data.applications || []).map((a) => ({
        id: a.applicationId ?? "",
        referenceCode: a.referenceCode,
        product: a.productName || a.purpose || t("application.loanProduct"),
        provider: a.partnerName || "Shohoj Rin",
        amount: a.requestedAmount ?? 0,
        status: a.status as AppStatus,
        submitted: a.submittedAt || a.createdAt || "",
        stage: statusToStage(a.status ?? ""),
      }));
      setApplications(mapped);
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    const refreshOnFocus = () => {
      void fetchApplications();
    };

    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, [fetchApplications]);

  const filtered = applications.filter((a) => matchesFilter(a.status, filter));
  const selected = applications.find((a) => a.id === selectedId) ?? null;

  const handleVerify = (appId: string) => {
    setVerifyingId(appId);
    setTimeout(() => {
      setVerifyingId(null);
      setVerifiedAlert(true);
      fetchApplications();
    }, 600);
  };

  const stageLabels = [
    t("appStatusPage.stage1"),
    t("appStatusPage.stage2"),
    t("appStatusPage.stage3"),
    t("appStatusPage.stage4"),
  ];

  function getTimelineFor(app: StoredApplication) {
    const steps = [
      { label: t("appStatusPage.stage1"), date: formatDate(app.submitted), done: true },
      {
        label: t("appStatusPage.stage2", { provider: app.provider }),
        date: app.stage >= 2 ? t("loanStatus.completed") : t("verification.pending"),
        done: app.stage >= 2,
      },
      {
        label:
          app.status === "rejected"
            ? t(enumKey("appStatus", "rejected"))
            : t("appStatusPage.stage3"),
        date: app.stage >= 3 ? t("loanStatus.completed") : t(enumKey("appStatus", "under-review")),
        done: app.stage >= 3,
      },
      {
        label: t("appStatusPage.stage4"),
        date: app.stage >= 4 ? t("loanStatus.completed") : t("verification.pending"),
        done: app.stage >= 4,
      },
    ];
    return steps;
  }

  return (
    <AppLayout onNavigate={onNavigate} currentPage="application-status">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          title={t("appStatusPage.title")}
          description={t("appStatusPage.description")}
          actions={
            <Button variant="primary" size="sm" onClick={() => onNavigate("loan-marketplace")}>
              + {t("appStatusPage.newApplication")}
            </Button>
          }
        />

        {verifiedAlert && (
          <Alert
            variant="success"
            title={t("appStatusPage.verifiedAlert")}
            dismissible
            className="mb-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span>{t("appStatusPage.verifiedAlert")}</span>
              <Button
                variant="primary"
                size="xs"
                className="shrink-0"
                onClick={() => onNavigate("active-loan")}
              >
                {t("appStatusPage.goToMyLoans")} →
              </Button>
            </div>
          </Alert>
        )}

        <Tabs
          className="mb-5"
          variant="pill"
          tabs={[
            { id: "all", label: t("appStatusPage.filterAll"), count: applications.length },
            {
              id: "in-progress",
              label: t("appStatusPage.filterInProgress"),
              count: applications.filter((a) => matchesFilter(a.status, "in-progress")).length,
            },
            {
              id: "approved",
              label: t("appStatusPage.filterApproved"),
              count: applications.filter((a) => matchesFilter(a.status, "approved")).length,
            },
            {
              id: "rejected",
              label: t("appStatusPage.filterRejected"),
              count: applications.filter((a) => matchesFilter(a.status, "rejected")).length,
            },
          ]}
          activeTab={filter}
          onChange={(id) => setFilter(id as FilterId)}
        />
        {filtered.length === 0 ? (
          <Card variant="plain">
            <EmptyState
              icon={EmptyIcons.search}
              title={t("appStatusPage.emptyTitle")}
              description={t("appStatusPage.emptyDescription")}
              action={{
                label: t("dashboard.exploreLoans"),
                onClick: () => onNavigate("loan-marketplace"),
              }}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((app) => {
              const isDisbursed = app.status === "disbursed";
              const isApproved = app.status === "approved";
              const showGoToLoans = isDisbursed || isApproved;
              return (
                <Card key={app.id} variant="plain" className="p-4 sm:p-5">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 sm:flex sm:justify-between sm:items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-semibold text-navy truncate">{app.product}</p>
                        {isDisbursed && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-light text-emerald border border-emerald/30">
                            {t("appStatusPage.activeInMyLoans")}
                          </span>
                        )}
                        {isApproved && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-yellow-light text-yellow-dark border border-yellow/30">
                            {t("dashboard.approvedLoan")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-stone-500 truncate">{app.provider}</p>
                      <p className="text-xs tabular-nums text-stone-400 mt-1">
                        {app.referenceCode ? `${app.referenceCode} · ` : ""}
                        {t("appStatusPage.submittedOn")} {formatDate(app.submitted)}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <AppStatusBadge status={app.status} />
                      <p className="tabular-nums text-sm font-semibold text-navy">
                        {formatTaka(app.amount)}
                      </p>
                    </div>
                  </div>

                  {app.status === "info-required" && (
                    <Alert
                      variant="warning"
                      title={t("appStatusPage.infoRequiredTitle")}
                      className="mt-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
                        <span>
                          {t("appStatusPage.infoRequiredBody", { provider: app.provider })}
                        </span>
                        <Button
                          variant="secondary"
                          size="xs"
                          className="shrink-0"
                          onClick={() => setSelectedId(app.id)}
                        >
                          {t("appStatusPage.submitDocuments")}
                        </Button>
                      </div>
                    </Alert>
                  )}

                  <div className="mt-5 overflow-x-auto">
                    <Stepper
                      steps={stageLabels.map((l) => ({ label: l }))}
                      currentStep={app.stage - 1}
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      {!showGoToLoans && isPrivilegedUser ? (
                        <Button
                          variant="primary"
                          size="xs"
                          loading={verifyingId === app.id}
                          onClick={() => handleVerify(app.id)}
                        >
                          {t("appStatusPage.verifyAndDisburse")}
                        </Button>
                      ) : showGoToLoans ? (
                        <Button
                          variant="secondary"
                          size="xs"
                          onClick={() => onNavigate("active-loan")}
                        >
                          {t("appStatusPage.goToMyLoans")} →
                        </Button>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      className="text-xs text-teal hover:underline"
                      onClick={() => setSelectedId(app.id)}
                    >
                      {t("appStatusPage.viewTimeline")}
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        <Modal
          open={!!selected}
          onClose={() => setSelectedId(null)}
          title={selected ? `${selected.product} — ${t("appStatusPage.viewTimeline")}` : ""}
          footer={
            <div className="flex items-center justify-between w-full">
              {selected &&
              selected.status !== "disbursed" &&
              selected.status !== "approved" &&
              isPrivilegedUser ? (
                <Button
                  variant="primary"
                  size="sm"
                  loading={verifyingId === selected.id}
                  onClick={() => {
                    handleVerify(selected.id);
                    setSelectedId(null);
                  }}
                >
                  {t("appStatusPage.verifyAndDisburse")}
                </Button>
              ) : selected &&
                (selected.status === "disbursed" || selected.status === "approved") ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedId(null);
                    onNavigate("active-loan");
                  }}
                >
                  {t("appStatusPage.goToMyLoans")}
                </Button>
              ) : null}
              <Button variant="secondary" size="sm" onClick={() => setSelectedId(null)}>
                {t("common.close")}
              </Button>
            </div>
          }
        >
          {selected && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-stone-500">{selected.provider}</p>
                  <p className="text-sm text-stone-400">{t("application.title")}</p>
                </div>
                <AppStatusBadge status={selected.status} />
              </div>
              <ol className="flex flex-col gap-3">
                {getTimelineFor(selected).map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3"
                    aria-current={!step.done && i === selected.stage - 1 ? "step" : undefined}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${step.done ? "bg-teal" : "bg-stone-300"}`}
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-medium ${step.done ? "text-navy" : "text-stone-400"}`}
                      >
                        {step.label}
                      </p>
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
