import type { Metadata } from "next";
import LenderPageClient from "./page.client";
import { requireAuthenticatedUser } from "../../lib/auth.server";

export const metadata: Metadata = {
  title: "Lender portfolio — Shohoj Rin",
  description:
    "Track deployed capital, yields, repayment performance and new funding opportunities.",
  openGraph: {
    title: "Lender portfolio — Shohoj Rin",
    description:
      "Track deployed capital, yields, repayment performance and new funding opportunities.",
  },
};

export default async function Page() {
  const user = await requireAuthenticatedUser();
  return <LenderPageClient user={user} />;
}
