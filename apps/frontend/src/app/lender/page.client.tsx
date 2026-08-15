"use client";

import LenderDashboard from "../../views/LenderDashboard";
import { useAppNavigate } from "../../lib/navigation";
import type { StoredUserProfile } from "../../lib/session";

export default function LenderPageClient({ user }: { user: StoredUserProfile }) {
  const navigate = useAppNavigate();
  return <LenderDashboard onNavigate={navigate} user={user} />;
}
