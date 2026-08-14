import { createFileRoute } from "@tanstack/react-router";
import FinancialEducation from "../pages/FinancialEducation";
import { useAppNavigate } from "../lib/navigation";
import { requireAuth } from "../lib/session";

export const Route = createFileRoute("/learn")({
  beforeLoad: () => requireAuth(),
  head: () => ({
    meta: [
      { title: "Financial education — learn before you borrow" },
      { name: "description", content: "Plain-language guides on interest, repayment, credit and budgeting, plus a loan cost calculator." },
      { property: "og:title", content: "Financial education — learn before you borrow" },
      { property: "og:description", content: "Plain-language guides on interest, repayment, credit and budgeting, plus a loan cost calculator." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <FinancialEducation onNavigate={navigate} />;
}
