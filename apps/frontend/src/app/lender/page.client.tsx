"use client";

import { useRequireAuth } from "../../lib/session";

import LenderDashboard from "../../views/LenderDashboard";
import { useAppNavigate } from "../../lib/navigation";

export default function LenderPageClient() {
  useRequireAuth();
  const navigate = useAppNavigate();
  return <LenderDashboard onNavigate={navigate} />;
}
