"use client";

import { useRequireAuth } from "../../lib/session";

import LoanMarketplace from "../../views/LoanMarketplace";
import { useAppNavigate } from "../../lib/navigation";

export default function LoansPageClient() {
  useRequireAuth();
  const navigate = useAppNavigate();
  return <LoanMarketplace onNavigate={navigate} />;
}
