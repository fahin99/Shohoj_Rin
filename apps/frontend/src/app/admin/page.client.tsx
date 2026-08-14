"use client";

import { useRequireAuth } from "../../lib/session";

import AdminDashboard from "../../views/AdminDashboard";
import { useAppNavigate } from "../../lib/navigation";

export default function AdminPageClient() {
  useRequireAuth();
  const navigate = useAppNavigate();
  return <AdminDashboard onNavigate={navigate} />;
}
