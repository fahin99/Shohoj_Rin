import type { Metadata } from "next";
import RepaymentPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Make a repayment — Shohoj_Rin",
  description:
    "Pay your instalment with bKash, Nagad, bank transfer or card, with fees shown up front.",
  openGraph: {
    title: "Make a repayment — Shohoj_Rin",
    description:
      "Pay your instalment with bKash, Nagad, bank transfer or card, with fees shown up front.",
  },
};

export default function Page() {
  return <RepaymentPageClient />;
}
