import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "../../../lib/auth.server";
import LenderOpportunitiesPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Funding opportunities — Shohoj Rin",
  description: "Review borrower loan applications matched to your lending priorities.",
};

export default async function Page() {
  const user = await requireAuthenticatedUser();
  if (user.role !== "lender") {
    redirect("/dashboard");
  }
  return <LenderOpportunitiesPageClient user={user} />;
}
