import type { LoanStatus, AppStatus } from "../types";

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
  const map: Record<LoanStatus, { variant: BadgeVariant; label: string }> = {
    active: { variant: "teal", label: "Active" },
    pending: { variant: "warning", label: "Pending" },
    approved: { variant: "success", label: "Approved" },
    rejected: { variant: "error", label: "Rejected" },
    disbursed: { variant: "sky", label: "Disbursed" },
    closed: { variant: "neutral", label: "Closed" },
    overdue: { variant: "error", label: "Overdue" },
  };

  const { variant, label } = map[status];
  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}

export function AppStatusBadge({ status }: { status: AppStatus }) {
  const map: Record<AppStatus, { variant: BadgeVariant; label: string }> = {
    submitted: { variant: "info", label: "Submitted" },
    "under-review": { variant: "warning", label: "Under Review" },
    "info-required": { variant: "warning", label: "Info Required" },
    approved: { variant: "success", label: "Approved" },
    rejected: { variant: "error", label: "Rejected" },
    disbursed: { variant: "teal", label: "Disbursed" },
  };

  const { variant, label } = map[status];
  return (
    <Badge variant={variant} dot>
      {label}
    </Badge>
  );
}
