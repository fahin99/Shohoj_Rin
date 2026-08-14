"use client";

import LoanMarketplace from "../../views/LoanMarketplace";
import { useAppNavigate } from "../../lib/navigation";

export default function LoansPageClient() {
  const navigate = useAppNavigate();
  return <LoanMarketplace onNavigate={navigate} />;
}
