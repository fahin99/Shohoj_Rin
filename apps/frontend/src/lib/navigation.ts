import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { PageName } from "../types";
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
  "lender-opportunities": "/lender/opportunities",
  admin: "/admin",
  "system-states": "/system-states",
  "investor-onboarding": "/investor-onboarding",
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
  "lender-dashboard": "Lender Portfolio",
  "lender-opportunities": "Funding Opportunities",
  admin: "Admin Dashboard",
  "system-states": "System States",
  "investor-onboarding": "Investor Onboarding",
};
export function useAppNavigate() {
  const router = useRouter();
  return useCallback(
    (page: PageName) => {
      router.push(PAGE_ROUTES[page]);
    },
    [router],
  );
}
