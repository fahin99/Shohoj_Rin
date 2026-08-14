"use client";

import LenderDashboard from "../../views/LenderDashboard";
import { useAppNavigate } from "../../lib/navigation";

export default function LenderPageClient() {
  const navigate = useAppNavigate();
  return <LenderDashboard onNavigate={navigate} />;
}
