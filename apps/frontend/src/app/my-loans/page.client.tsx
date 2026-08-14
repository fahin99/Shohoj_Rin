"use client";

import { useRequireAuth } from "../../lib/session";

import ActiveLoanDetails from "../../views/ActiveLoanDetails";
import { useAppNavigate } from "../../lib/navigation";

export default function MyLoansPageClient() {
  useRequireAuth();
  const navigate = useAppNavigate();
  return <ActiveLoanDetails onNavigate={navigate} />;
}
