import { createFileRoute } from "@tanstack/react-router";
import LoanDetails from "../pages/LoanDetails";
import { useAppNavigate } from "../lib/navigation";

export const Route = createFileRoute("/loans/details")({
  head: () => ({
    meta: [
      { title: "Loan details and repayment estimate" },
      { name: "description", content: "Full terms, eligibility, fees and an estimated repayment schedule before you apply." },
      { property: "og:title", content: "Loan details and repayment estimate" },
      { property: "og:description", content: "Full terms, eligibility, fees and an estimated repayment schedule before you apply." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <LoanDetails onNavigate={navigate} />;
}
