"use client";

import ActiveLoanDetails from "../../views/ActiveLoanDetails";
import { useAppNavigate } from "../../lib/navigation";

export default function MyLoansPageClient() {
  const navigate = useAppNavigate();
  return <ActiveLoanDetails onNavigate={navigate} />;
}
