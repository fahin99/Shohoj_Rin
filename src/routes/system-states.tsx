import { createFileRoute } from "@tanstack/react-router";
import SystemStates from "../pages/SystemStates";
import { useAppNavigate } from "../lib/navigation";

export const Route = createFileRoute("/system-states")({
  head: () => ({
    meta: [
      { title: "System states reference — Shohoj_Rin" },
      { name: "description", content: "Loading, empty, error and component states documented for the Shohoj_Rin design system." },
      { property: "og:title", content: "System states reference — Shohoj_Rin" },
      { property: "og:description", content: "Loading, empty, error and component states documented for the Shohoj_Rin design system." },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useAppNavigate();
  return <SystemStates onNavigate={navigate} />;
}
