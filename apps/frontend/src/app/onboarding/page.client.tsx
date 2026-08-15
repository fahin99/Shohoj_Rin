"use client";

import OnboardingPage from "../../views/OnboardingPage";
import { useAppNavigate } from "../../lib/navigation";

export default function OnboardingPageClient() {
  const navigate = useAppNavigate();
  return <OnboardingPage onNavigate={navigate} />;
}
