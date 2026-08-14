"use client";

import { useRequireAuth } from "../../lib/session";

import ApplicationStatus from "../../views/ApplicationStatus";
import { useAppNavigate } from "../../lib/navigation";

export default function ApplicationsPageClient() {
  useRequireAuth();
  const navigate = useAppNavigate();
  return <ApplicationStatus onNavigate={navigate} />;
}
