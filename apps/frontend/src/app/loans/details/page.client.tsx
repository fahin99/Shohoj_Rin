"use client";

import { useRequireAuth } from "../../../lib/session";

import LoanDetails from "../../../views/LoanDetails";
import { useAppNavigate } from "../../../lib/navigation";

export default function LoanDetailsPageClient() {
  useRequireAuth();
  const navigate = useAppNavigate();
  return <LoanDetails onNavigate={navigate} />;
}
