import { useRouter } from "@tanstack/react-router";
import { useCallback } from "react";
import type { PageName } from "../types";

/**
 * Single source of truth mapping the design-system page names (used by every
 * page component's `onNavigate` prop) to real file-based routes.
 */
export const PAGE_ROUTES: Record<PageName, string> = {
  landing: "/",
  auth: "/auth",
  onboarding: "/onboarding",
  "borrower-dashboard": "/dashboard",
  "loan-marketplace": "/loans",
  "loan-details": "/loans/details",
  "loan-application": "/apply",
  "application-status": "/applications",
  "active-loan": "/my-loans",
  repayment: "/repayment",
  education: "/learn",
  "lender-dashboard": "/lender",
  admin: "/admin",
  "system-states": "/system-states",
};

export const PAGE_LABELS: Record<PageName, string> = {
  landing: "Home",
  auth: "Log in / Register",
  onboarding: "Onboarding",
  "borrower-dashboard": "Borrower Dashboard",
  "loan-marketplace": "Loan Marketplace",
  "loan-details": "Loan Details",
  "loan-application": "Loan Application",
  "application-status": "Application Status",
  "active-loan": "Active Loan",
  repayment: "Repayment",
  education: "Financial Education",
  "lender-dashboard": "Lender Dashboard",
  admin: "Admin Dashboard",
  "system-states": "System States",
};

export function useAppNavigate() {
  const router = useRouter();
  return useCallback(
    (page: PageName) => {
      void router.navigate({ to: PAGE_ROUTES[page] });
    },
    [router],
  );
}
