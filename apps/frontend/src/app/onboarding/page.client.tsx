"use client";

import { useRequireAuth } from "../../lib/session";

import OnboardingPage from "../../views/OnboardingPage";
import { useAppNavigate } from "../../lib/navigation";

export default function OnboardingPageClient() {
  useRequireAuth();
  const navigate = useAppNavigate();
  return <OnboardingPage onNavigate={navigate} />;
}
