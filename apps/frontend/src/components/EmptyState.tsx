import type { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
  size?: "sm" | "md";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
  size = "md",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-6 ${size === "sm" ? "py-8" : ""} ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-[8px] bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 mb-4">
          {icon}
        </div>
      )}
      <h3 className={`font-semibold text-navy mb-1 ${size === "sm" ? "text-sm" : "text-base"}`}>
        {title}
      </h3>
      {description && (
        <p
          className={`text-stone-500 leading-relaxed max-w-xs ${size === "sm" ? "text-xs" : "text-sm"}`}
        >
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-5">
          {action && (
            <Button variant="primary" size={size === "sm" ? "sm" : "md"} onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="secondary"
              size={size === "sm" ? "sm" : "md"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

const EmptyIcons = {
  loans: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M12 10v4M10 12h4" strokeLinecap="round" />
    </svg>
  ),
  transactions: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M7 16l-4-4 4-4M17 8l4 4-4 4M14 4l-4 16"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  notifications: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  search: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
    </svg>
  ),
  error: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </svg>
  ),
};

export { EmptyIcons };
