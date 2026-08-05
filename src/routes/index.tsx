import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "../pages/LandingPage";
import { useAppNavigate } from "../lib/navigation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shohoj_Rin — Borrow with clarity, repay with confidence" },
      {
        name: "description",
        content:
          "Discover loans that fit your life, understand every term in plain language, and manage repayments from one clear dashboard. Built for first-time borrowers in Bangladesh.",
      },
      { property: "og:title", content: "Shohoj_Rin — Borrow with clarity, repay with confidence" },
      {
        property: "og:description",
        content:
          "Compare transparent loan options, see exactly what you will repay, and track every instalment in one place.",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <LandingPage onNavigate={navigate} />;
}
