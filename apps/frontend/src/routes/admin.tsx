import { createFileRoute } from "@tanstack/react-router";
import AdminDashboard from "../pages/AdminDashboard";
import { useAppNavigate } from "../lib/navigation";
import { requireAuth } from "../lib/session";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => requireAuth(),
  head: () => ({
    meta: [
      { title: "Admin console — Shohoj_Rin" },
      { name: "description", content: "Review applications, monitor approvals, disbursements and overdue accounts." },
      { property: "og:title", content: "Admin console — Shohoj_Rin" },
      { property: "og:description", content: "Review applications, monitor approvals, disbursements and overdue accounts." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <AdminDashboard onNavigate={navigate} />;
}
