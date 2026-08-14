import { createFileRoute } from "@tanstack/react-router";
import BorrowerDashboard from "../pages/BorrowerDashboard";
import { useAppNavigate } from "../lib/navigation";
import { requireAuth } from "../lib/session";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => requireAuth(),
  head: () => ({
    meta: [
      { title: "Borrower dashboard — Shohoj_Rin" },
      { name: "description", content: "See your active loan, next payment, balance and applications in one clear view." },
      { property: "og:title", content: "Borrower dashboard — Shohoj_Rin" },
      { property: "og:description", content: "See your active loan, next payment, balance and applications in one clear view." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <BorrowerDashboard onNavigate={navigate} />;
}
