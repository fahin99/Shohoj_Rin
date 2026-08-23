"use client";
import SystemStates from "../../views/SystemStates";
import { useAppNavigate } from "../../lib/navigation";
export default function SystemStatesPageClient() {
  const navigate = useAppNavigate();
  return <SystemStates onNavigate={navigate} />;
}
