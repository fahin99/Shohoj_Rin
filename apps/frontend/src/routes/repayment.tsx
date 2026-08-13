import { createFileRoute } from "@tanstack/react-router";
import RepaymentPage from "../pages/RepaymentPage";
import { useAppNavigate } from "../lib/navigation";
import { requireAuth } from "../lib/session";

export const Route = createFileRoute("/repayment")({
  beforeLoad: () => requireAuth(),
  head: () => ({
    meta: [
      { title: "Make a repayment — Shohoj_Rin" },
      { name: "description", content: "Pay your instalment with bKash, Nagad, bank transfer or card, with fees shown up front." },
      { property: "og:title", content: "Make a repayment — Shohoj_Rin" },
      { property: "og:description", content: "Pay your instalment with bKash, Nagad, bank transfer or card, with fees shown up front." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <RepaymentPage onNavigate={navigate} />;
}
