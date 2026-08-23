import type { Metadata } from "next";
import ApplicationsPageClient from "./page.client";
import { requireAuthenticatedUser } from "../../lib/auth.server";
export const metadata: Metadata = {
  title: "My loan applications — Shohoj Rin",
  description:
    "Track the status of every application, from submission through review to disbursement.",
  openGraph: {
    title: "My loan applications — Shohoj Rin",
    description:
      "Track the status of every application, from submission through review to disbursement.",
  },
};
export default async function Page() {
  await requireAuthenticatedUser();
  return <ApplicationsPageClient />;
}
