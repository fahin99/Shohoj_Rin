"use client";

import { useRequireAuth } from "../../lib/session";

import SystemStates from "../../views/SystemStates";
import { useAppNavigate } from "../../lib/navigation";

export default function SystemStatesPageClient() {
  useRequireAuth();
  const navigate = useAppNavigate();
  return <SystemStates onNavigate={navigate} />;
}
