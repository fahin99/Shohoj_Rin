"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "../../../components/AppLayout";
import { PageHeader } from "../../../components/PageHeader";
import { Badge } from "../../../components/Badge";
import { Button } from "../../../components/Button";
import { formatTaka, formatPercent } from "../../../lib/format";
import { fundOpportunity, getOpportunities, rejectOpportunity } from "../../../lib/api/investor";
import { getDisplayName, type StoredUserProfile } from "../../../lib/session";
import type { PageName } from "../../../types";
import { useTranslation } from "../../../lib/language-context";
import { enumKey } from "../../../lib/enum-labels";

interface TrustFactor {
  name: string;
  score: number;
  weight: number | null;
  description: string | null;
}

interface Opportunity {
  applicationId: string;
  borrowerName: string | null;
  purpose: string | null;
  purposeDescription?: string | null;
  requestedAmount: number;
  status: string;
  submittedAt: string | null;
  productName: string | null;
  category: string | null;
  interestRate: number | null;
  durationMonths: number | null;
  partnerName: string | null;
  trustBand: string | null;
  trustScore: number | null;
  committedAmount: number;
  trustFactors: TrustFactor[];
}

const trustBandDisplay: Record<string, { tone: "success" | "warning" | "error" }> = {
  very_low_risk: { tone: "success" },
  low_risk: { tone: "success" },
  moderate_risk: { tone: "warning" },
  high_risk: { tone: "error" },
  very_high_risk: { tone: "error" },
};

export default function LenderOpportunitiesPageClient({ user }: { user: StoredUserProfile }) {
  const { t } = useTranslation();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [fundAmounts, setFundAmounts] = useState<Record<string, string>>({});
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const userName = getDisplayName(user);
  const firstName = userName.split(" ")[0] ?? userName;

  const load = async () => {
    try {
      setError(null);
      const data = await getOpportunities();
      setOpportunities(Array.isArray(data) ? (data as Opportunity[]) : []);
    } catch (err) {
      console.error("Failed to fetch lender opportunities", err);
      setError(err instanceof Error ? err.message : "Failed to fetch opportunities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleFund = async (opportunity: Opportunity) => {
    const remaining = Math.max(0, opportunity.requestedAmount - opportunity.committedAmount);
    const amount = Number(fundAmounts[opportunity.applicationId] || remaining);
    if (!Number.isFinite(amount) || amount <= 0 || amount > remaining) {
      setError(`Enter a funding amount between ৳1 and ${formatTaka(remaining)}.`);
      return;
    }

    try {
      setFundingId(opportunity.applicationId);
      setError(null);
      await fundOpportunity(opportunity.applicationId, amount);
      await load();
    } catch (err) {
      console.error("Failed to fund opportunity", err);
      setError(err instanceof Error ? err.message : "Failed to record funding commitment");
    } finally {
      setFundingId(null);
    }
  };

  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const handleReject = async (opportunity: Opportunity) => {
    try {
      setRejectingId(opportunity.applicationId);
      setError(null);
      await rejectOpportunity(opportunity.applicationId);
      setRejectedIds((prev) => new Set(prev).add(opportunity.applicationId));
    } catch (err) {
      console.error("Failed to reject opportunity", err);
      setError(err instanceof Error ? err.message : "Failed to reject opportunity");
    } finally {
      setRejectingId(null);
    }
  };

  const toggle = (applicationId: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(applicationId)) next.delete(applicationId);
      else next.add(applicationId);
      return next;
    });
  };

  return (
    <AppLayout
      onNavigate={(page: PageName) => {
        window.location.href = page === "lender-dashboard" ? "/lender" : "/lender/opportunities";
      }}
      currentPage="lender-opportunities"
      userType="lender"
      userName={userName}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <PageHeader
          eyebrow={t("lender.fundingOpportunities")}
          title={t("lender.fundingOpportunities")}
          description={t("lender.fundingOpportunitiesHint")}
        />

        {error && (
          <div className="mb-5 rounded-[6px] border-[1.5px] border-coral bg-coral/5 px-4 py-3 text-sm text-navy">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-8 text-sm text-stone-500">
            {t("common.loading")}
          </div>
        ) : opportunities.length === 0 ? (
          <div className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-8">
            <h2 className="text-sm font-semibold text-navy">
              {t("lender.noMatchingOpportunities")}
            </h2>
            <p className="text-sm text-stone-500 mt-1">{t("lender.noMatchingOpportunities")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {opportunities
              .filter((o) => !rejectedIds.has(o.applicationId))
              .map((opportunity) => {
                const remaining = Math.max(
                  0,
                  opportunity.requestedAmount - opportunity.committedAmount,
                );
                const band = opportunity.trustBand ? trustBandDisplay[opportunity.trustBand] : null;
                const isExpanded = expanded.has(opportunity.applicationId);
                const isFunding = fundingId === opportunity.applicationId;

                return (
                  <article
                    key={opportunity.applicationId}
                    className="bg-white border-[1.5px] border-stone-200 rounded-[8px] p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-navy truncate">
                          {opportunity.borrowerName || t("auth.roleBorrowerTitle")}
                        </p>
                        <p className="text-sm text-stone-500 mt-0.5">
                          {opportunity.category || opportunity.purpose
                            ? t(enumKey("category", (opportunity.category || opportunity.purpose)!))
                            : t("application.loanProduct")}
                          {opportunity.productName ? ` · ${opportunity.productName}` : ""}
                        </p>
                      </div>
                      {band && (
                        <Badge variant={band.tone} size="sm" dot>
                          {t(enumKey("trustBand", opportunity.trustBand!))}
                        </Badge>
                      )}
                    </div>

                    {opportunity.purposeDescription && (
                      <p className="text-sm text-stone-600 mt-3">
                        {opportunity.purposeDescription}
                      </p>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-stone-400">
                          {t("lender.requested")}
                        </p>
                        <p className="text-sm font-semibold text-navy mt-0.5">
                          {formatTaka(opportunity.requestedAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-stone-400">
                          {t("lender.remaining")}
                        </p>
                        <p className="text-sm font-semibold text-navy mt-0.5">
                          {formatTaka(remaining)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-stone-400">
                          {t("loanDetails.interestRate")}
                        </p>
                        <p className="text-sm font-semibold text-navy mt-0.5">
                          {opportunity.interestRate == null
                            ? "—"
                            : formatPercent(opportunity.interestRate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-stone-400">
                          {t("loanDetails.tenure")}
                        </p>
                        <p className="text-sm font-semibold text-navy mt-0.5">
                          {opportunity.durationMonths == null
                            ? "—"
                            : t("loanDetails.monthsUnit", { months: opportunity.durationMonths })}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[6px] bg-stone-50 border border-stone-200 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-stone-400">
                            {t("lender.trustScore")}
                          </p>
                          <p className="text-xl font-semibold text-navy mt-0.5">
                            {opportunity.trustScore == null
                              ? t("common.notAvailable")
                              : `${opportunity.trustScore}/100`}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="text-xs font-medium text-teal hover:underline"
                          onClick={() => toggle(opportunity.applicationId)}
                        >
                          {isExpanded ? t("lender.hideBreakdown") : t("lender.showBreakdown")}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 border-t border-stone-200 pt-3 flex flex-col gap-2.5">
                          {opportunity.trustFactors.length === 0 ? (
                            <p className="text-xs text-stone-500">{t("common.notAvailable")}</p>
                          ) : (
                            opportunity.trustFactors.map((factor) => (
                              <div key={`${opportunity.applicationId}-${factor.name}`}>
                                <div className="flex items-center justify-between gap-3 text-xs">
                                  <span className="font-medium text-navy">
                                    {t(enumKey("trustFactor", factor.name))}
                                  </span>
                                  <span className="tabular-nums text-stone-500">
                                    {factor.score}
                                    {factor.weight == null
                                      ? ""
                                      : ` · ${Math.round(factor.weight * 100)}%`}
                                  </span>
                                </div>
                                {factor.description && (
                                  <p className="text-[11px] text-stone-500 mt-0.5">
                                    {factor.description}
                                  </p>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-2">
                      <input
                        type="number"
                        min="1"
                        max={remaining}
                        step="0.01"
                        value={fundAmounts[opportunity.applicationId] ?? ""}
                        onChange={(event) =>
                          setFundAmounts((current) => ({
                            ...current,
                            [opportunity.applicationId]: event.target.value,
                          }))
                        }
                        placeholder={t("lender.upTo", { amount: formatTaka(remaining) })}
                        className="h-10 flex-1 rounded-[6px] border-[1.5px] border-stone-300 px-3 text-sm text-navy outline-none focus:border-teal"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => void handleReject(opportunity)}
                        disabled={isFunding || rejectingId === opportunity.applicationId}
                      >
                        {rejectingId === opportunity.applicationId
                          ? t("common.loading")
                          : t("lender.notNow")}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => void handleFund(opportunity)}
                        disabled={isFunding || remaining <= 0}
                      >
                        {isFunding ? t("common.loading") : t("lender.fund")}
                      </Button>
                    </div>
                  </article>
                );
              })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
