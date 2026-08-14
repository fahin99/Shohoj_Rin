import type { Metadata } from "next";
import ApplicationsPageClient from "./page.client";

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

export default function Page() {
  return <ApplicationsPageClient />;
}
