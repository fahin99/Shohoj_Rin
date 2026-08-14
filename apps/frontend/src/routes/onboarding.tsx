import { createFileRoute } from "@tanstack/react-router";
import OnboardingPage from "../pages/OnboardingPage";
import { useAppNavigate } from "../lib/navigation";
import { requireAuth } from "../lib/session";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: () => requireAuth(),
  head: () => ({
    meta: [
      { title: "Set up your Shohoj_Rin profile" },
      { name: "description", content: "Tell us about your goals and income so we can match you with loans you actually qualify for." },
      { property: "og:title", content: "Set up your Shohoj_Rin profile" },
      { property: "og:description", content: "Tell us about your goals and income so we can match you with loans you actually qualify for." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <OnboardingPage onNavigate={navigate} />;
}
