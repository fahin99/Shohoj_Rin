import type { Metadata } from "next";
import RepaymentPageClient from "./page.client";
import { requireAuthenticatedUser } from "../../lib/auth.server";

export const metadata: Metadata = {
  title: "Make a repayment — Shohoj Rin",
  description:
    "Pay your instalment with bKash, Nagad, bank transfer or card, with fees shown up front.",
  openGraph: {
    title: "Make a repayment — Shohoj Rin",
    description:
      "Pay your instalment with bKash, Nagad, bank transfer or card, with fees shown up front.",
  },
};

export default async function Page() {
  await requireAuthenticatedUser();
  return <RepaymentPageClient />;
}
