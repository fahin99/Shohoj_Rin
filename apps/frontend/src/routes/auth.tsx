import { createFileRoute } from "@tanstack/react-router";
import AuthPage from "../pages/AuthPage";
import { useAppNavigate } from "../lib/navigation";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Log in or create your Shohoj_Rin account" },
      { name: "description", content: "Sign in to track loans and repayments, or register in minutes to start exploring loan options." },
      { property: "og:title", content: "Log in or create your Shohoj_Rin account" },
      { property: "og:description", content: "Sign in to track loans and repayments, or register in minutes to start exploring loan options." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <AuthPage onNavigate={navigate} />;
}
