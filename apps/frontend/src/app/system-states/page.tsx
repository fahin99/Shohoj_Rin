import type { Metadata } from "next";
import SystemStatesPageClient from "./page.client";
import { requireAuthenticatedUser } from "../../lib/auth.server";

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

export default async function Page() {
  await requireAuthenticatedUser();
  return <SystemStatesPageClient />;
}
