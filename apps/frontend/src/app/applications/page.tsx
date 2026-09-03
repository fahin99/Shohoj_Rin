import type { Metadata } from "next";
import { redirect } from "next/navigation";
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
  const user = await requireAuthenticatedUser();
  if (user.role === "lender") {
    redirect("/lender/opportunities");
  }
  return <ApplicationsPageClient />;
}
