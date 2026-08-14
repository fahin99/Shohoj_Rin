"use client";

import ApplicationStatus from "../../views/ApplicationStatus";
import { useAppNavigate } from "../../lib/navigation";

export default function ApplicationsPageClient() {
  const navigate = useAppNavigate();
  return <ApplicationStatus onNavigate={navigate} />;
}
