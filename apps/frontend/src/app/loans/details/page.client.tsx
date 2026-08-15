"use client";

import LoanDetails from "../../../views/LoanDetails";
import { useAppNavigate } from "../../../lib/navigation";

export default function LoanDetailsPageClient() {
  const navigate = useAppNavigate();
  return <LoanDetails onNavigate={navigate} />;
}
