"use client";

import AdminDashboard from "../../views/AdminDashboard";
import { useAppNavigate } from "../../lib/navigation";

export default function AdminPageClient() {
  const navigate = useAppNavigate();
  return <AdminDashboard onNavigate={navigate} />;
}
