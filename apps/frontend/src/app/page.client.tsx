"use client";

import LandingPage from "../views/LandingPage";
import { useAppNavigate } from "../lib/navigation";

export default function LandingPageClient() {
  const navigate = useAppNavigate();
  return <LandingPage onNavigate={navigate} />;
}
