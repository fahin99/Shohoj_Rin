"use client";

import { useRequireAuth } from "../../lib/session";

import BorrowerDashboard from "../../views/BorrowerDashboard";
import { useAppNavigate } from "../../lib/navigation";

export default function DashboardPageClient() {
  useRequireAuth();
  const navigate = useAppNavigate();
  return <BorrowerDashboard onNavigate={navigate} />;
}
