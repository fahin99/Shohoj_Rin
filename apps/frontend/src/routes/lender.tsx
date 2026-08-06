import { createFileRoute } from "@tanstack/react-router";
import LenderDashboard from "../pages/LenderDashboard";
import { useAppNavigate } from "../lib/navigation";

export const Route = createFileRoute("/lender")({
  head: () => ({
    meta: [
      { title: "Lender portfolio — Shohoj_Rin" },
      { name: "description", content: "Track deployed capital, yields, repayment performance and new funding opportunities." },
      { property: "og:title", content: "Lender portfolio — Shohoj_Rin" },
      { property: "og:description", content: "Track deployed capital, yields, repayment performance and new funding opportunities." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <LenderDashboard onNavigate={navigate} />;
}
