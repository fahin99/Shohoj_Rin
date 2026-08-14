import type { Metadata } from "next";
import LenderPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Lender portfolio — Shohoj_Rin",
  description:
    "Track deployed capital, yields, repayment performance and new funding opportunities.",
  openGraph: {
    title: "Lender portfolio — Shohoj_Rin",
    description:
      "Track deployed capital, yields, repayment performance and new funding opportunities.",
  },
};

export default function Page() {
  return <LenderPageClient />;
}
