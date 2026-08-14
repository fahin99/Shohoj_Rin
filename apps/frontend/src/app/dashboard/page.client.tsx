"use client";

import BorrowerDashboard from "../../views/BorrowerDashboard";
import { useAppNavigate } from "../../lib/navigation";

export default function DashboardPageClient() {
  const navigate = useAppNavigate();
  return <BorrowerDashboard onNavigate={navigate} />;
}
