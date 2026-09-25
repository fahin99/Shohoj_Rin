"use client";

import type { LoanStatus, AppStatus } from "../types";
import { useTranslation } from "../lib/language-context";
import { enumKey } from "../lib/enum-labels";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral" | "teal" | "sky";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-emerald-light text-emerald border border-emerald/30",
  warning: "bg-yellow-light text-stone-700 border border-yellow/40",
  error: "bg-coral-light text-coral border border-coral/30",
  info: "bg-sky-light text-sky border border-sky/30",
  neutral: "bg-stone-100 text-stone-600 border border-stone-200",
  teal: "bg-teal-light text-teal border border-teal/30",
  sky: "bg-sky-light text-sky border border-sky/30",
};

const dotColors: Record<BadgeVariant, string> = {
  success: "bg-emerald",
  warning: "bg-yellow",
  error: "bg-coral",
  info: "bg-sky",
  neutral: "bg-stone-400",
  teal: "bg-teal",
  sky: "bg-sky",
};

export function Badge({
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  className = "",
}: BadgeProps) {
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-[4px] ${sizeClass} ${variantClasses[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}

export function LoanStatusBadge({ status }: { status: LoanStatus }) {
  const { t } = useTranslation();
  const map: Record<LoanStatus, { variant: BadgeVariant; label: string }> = {
    pending_disbursement: { variant: "warning", label: "Pending disbursement" },
    active: { variant: "teal", label: "Active" },
    completed: { variant: "neutral", label: "Completed" },
    overdue: { variant: "error", label: "Overdue" },
    delinquent: { variant: "error", label: "Delinquent" },
    defaulted: { variant: "error", label: "Defaulted" },
  };
  const { variant } = map[status];
  return (
    <Badge variant={variant} dot>
      {t(enumKey("loanStatus", status))}
    </Badge>
  );
}

export function AppStatusBadge({ status }: { status: AppStatus }) {
  const { t } = useTranslation();
  const toneMap: Record<string, BadgeVariant> = {
    submitted: "info",
    "under-review": "warning",
    under_review: "warning",
    "info-required": "warning",
    info_required: "warning",
    approved: "success",
    rejected: "error",
    disbursed: "teal",
  };
  const normalizedKey =
    status === "under_review"
      ? "under-review"
      : status === "info_required"
        ? "info-required"
        : status;
  return (
    <Badge variant={toneMap[status] ?? "neutral"} dot>
      {t(enumKey("appStatus", normalizedKey))}
    </Badge>
  );
}
