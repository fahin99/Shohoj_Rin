"use client";

import { useRequireAuth } from "../../lib/session";

import LoanApplication from "../../views/LoanApplication";
import { useAppNavigate } from "../../lib/navigation";

export default function ApplyPageClient() {
  useRequireAuth();
  const navigate = useAppNavigate();
  return <LoanApplication onNavigate={navigate} />;
}
