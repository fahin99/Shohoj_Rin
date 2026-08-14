"use client";

import FinancialEducation from "../../views/FinancialEducation";
import { useAppNavigate } from "../../lib/navigation";

export default function LearnPageClient() {
  const navigate = useAppNavigate();
  return <FinancialEducation onNavigate={navigate} />;
}
