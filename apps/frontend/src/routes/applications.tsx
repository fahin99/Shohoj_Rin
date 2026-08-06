import { createFileRoute } from "@tanstack/react-router";
import ApplicationStatus from "../pages/ApplicationStatus";
import { useAppNavigate } from "../lib/navigation";

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "My loan applications — Shohoj_Rin" },
      { name: "description", content: "Track the status of every application, from submission through review to disbursement." },
      { property: "og:title", content: "My loan applications — Shohoj_Rin" },
      { property: "og:description", content: "Track the status of every application, from submission through review to disbursement." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <ApplicationStatus onNavigate={navigate} />;
}
