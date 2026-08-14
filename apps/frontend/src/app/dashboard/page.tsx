import type { Metadata } from "next";
import DashboardPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Borrower dashboard — Shohoj Rin",
  description:
    "See your active loan, next payment, balance and applications in one clear view.",
  openGraph: {
    title: "Borrower dashboard — Shohoj Rin",
    description:
      "See your active loan, next payment, balance and applications in one clear view.",
  },
};

export default function Page() {
  return <DashboardPageClient />;
}
