import { createFileRoute } from "@tanstack/react-router";
import LoanMarketplace from "../pages/LoanMarketplace";
import { useAppNavigate } from "../lib/navigation";

export const Route = createFileRoute("/loans/")({
  head: () => ({
    meta: [
      { title: "Loan marketplace — compare loans clearly" },
      { name: "description", content: "Browse and compare education, emergency, business and personal loans with transparent rates and terms." },
      { property: "og:title", content: "Loan marketplace — compare loans clearly" },
      { property: "og:description", content: "Browse and compare education, emergency, business and personal loans with transparent rates and terms." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <LoanMarketplace onNavigate={navigate} />;
}
