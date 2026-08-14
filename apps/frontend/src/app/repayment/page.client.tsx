"use client";

import { useRequireAuth } from "../../lib/session";

import RepaymentPage from "../../views/RepaymentPage";
import { useAppNavigate } from "../../lib/navigation";

export default function RepaymentPageClient() {
  useRequireAuth();
  const navigate = useAppNavigate();
  return <RepaymentPage onNavigate={navigate} />;
}
