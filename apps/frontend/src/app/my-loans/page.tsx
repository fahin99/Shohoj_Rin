import type { Metadata } from "next";
import MyLoansPageClient from "./page.client";

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

export default function Page() {
  return <MyLoansPageClient />;
}
