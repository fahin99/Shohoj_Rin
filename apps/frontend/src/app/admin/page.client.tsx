"use client";

import AdminDashboard from "../../views/AdminDashboard";
import { useAppNavigate } from "../../lib/navigation";
import type { StoredUserProfile } from "../../lib/session";

export default function AdminPageClient({ user }: { user: StoredUserProfile }) {
  const navigate = useAppNavigate();
  return <AdminDashboard onNavigate={navigate} user={user} />;
}
