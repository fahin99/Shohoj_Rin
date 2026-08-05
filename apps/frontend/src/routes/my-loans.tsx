import { createFileRoute } from "@tanstack/react-router";
import ActiveLoanDetails from "../pages/ActiveLoanDetails";
import { useAppNavigate } from "../lib/navigation";

export const Route = createFileRoute("/my-loans")({
  head: () => ({
    meta: [
      { title: "My active loan — Shohoj_Rin" },
      { name: "description", content: "Balance, repayment schedule, interest paid and transaction history for your active loan." },
      { property: "og:title", content: "My active loan — Shohoj_Rin" },
      { property: "og:description", content: "Balance, repayment schedule, interest paid and transaction history for your active loan." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <ActiveLoanDetails onNavigate={navigate} />;
}
