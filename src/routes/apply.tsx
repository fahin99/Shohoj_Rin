import { createFileRoute } from "@tanstack/react-router";
import LoanApplication from "../pages/LoanApplication";
import { useAppNavigate } from "../lib/navigation";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply for a loan — Shohoj_Rin" },
      { name: "description", content: "A short, plain-language application. Review every cost before you submit." },
      { property: "og:title", content: "Apply for a loan — Shohoj_Rin" },
      { property: "og:description", content: "A short, plain-language application. Review every cost before you submit." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <LoanApplication onNavigate={navigate} />;
}
