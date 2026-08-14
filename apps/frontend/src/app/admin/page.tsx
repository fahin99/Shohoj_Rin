import type { Metadata } from "next";
import AdminPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Admin console — Shohoj Rin",
  description:
    "Review loan providers, platform health, compliance metrics, and application queues.",
  openGraph: {
    title: "Admin console — Shohoj Rin",
    description:
      "Review applications, monitor approvals, disbursements and overdue accounts.",
  },
};

export default function Page() {
  return <AdminPageClient />;
}
