"use client";

import LoanApplication from "../../views/LoanApplication";
import { useAppNavigate } from "../../lib/navigation";

export default function ApplyPageClient() {
  const navigate = useAppNavigate();
  return <LoanApplication onNavigate={navigate} />;
}
