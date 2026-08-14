import type { Metadata } from "next";
import SystemStatesPageClient from "./page.client";

export const metadata: Metadata = {
  title: "System states reference — Shohoj Rin",
  description:
    "Loading, empty, error and component states documented for the Shohoj Rin design system.",
  openGraph: {
    title: "System states reference — Shohoj Rin",
    description:
      "Loading, empty, error and component states documented for the Shohoj Rin design system.",
  },
};

export default function Page() {
  return <SystemStatesPageClient />;
}
