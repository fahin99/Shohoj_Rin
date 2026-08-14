"use client";

import RepaymentPage from "../../views/RepaymentPage";
import { useAppNavigate } from "../../lib/navigation";

export default function RepaymentPageClient() {
  const navigate = useAppNavigate();
  return <RepaymentPage onNavigate={navigate} />;
}
