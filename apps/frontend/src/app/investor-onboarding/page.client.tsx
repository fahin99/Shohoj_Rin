"use client";
import InvestorOnboarding from "../../views/InvestorOnboarding";
import { useAppNavigate } from "../../lib/navigation";
export default function InvestorOnboardingPageClient() {
  const navigate = useAppNavigate();
  return <InvestorOnboarding onNavigate={navigate} />;
}