"use client";

import BorrowerDashboard from "../../views/BorrowerDashboard";
import { useAppNavigate } from "../../lib/navigation";
import type { StoredUserProfile } from "../../lib/session";

export default function DashboardPageClient({ user }: { user: StoredUserProfile }) {
  const navigate = useAppNavigate();
  return <BorrowerDashboard onNavigate={navigate} user={user} />;
}
