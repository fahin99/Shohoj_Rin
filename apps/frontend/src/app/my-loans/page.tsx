import type { Metadata } from "next";
import MyLoansPageClient from "./page.client";
import { requireAuthenticatedUser } from "../../lib/auth.server";
export const metadata: Metadata = {
  title: "My active loan — Shohoj Rin",
  description:
    "Balance, repayment schedule, interest paid and transaction history for your active loan.",
  openGraph: {
    title: "My active loan — Shohoj Rin",
    description:
      "Balance, repayment schedule, interest paid and transaction history for your active loan.",
  },
};
export default async function Page() {
  await requireAuthenticatedUser();
  return <MyLoansPageClient />;
}
