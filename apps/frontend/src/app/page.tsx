import type { Metadata } from "next";
import LandingPageClient from "./page.client";
import { getCurrentUser } from "../lib/auth.server";
export const metadata: Metadata = {
  title: "Shohoj Rin — Borrow with clarity, repay with confidence",
  description:
    "Discover loans that fit your life, understand every term in plain language, and manage repayments from one clear dashboard. Built for first-time borrowers in Bangladesh.",
  openGraph: {
    title: "Shohoj Rin — Borrow with clarity, repay with confidence",
    description:
      "Compare transparent loan options, see exactly what you will repay, and track every instalment in one place.",
  },
};
export default async function Page() {
  const user = await getCurrentUser();
  return <LandingPageClient user={user} />;
}
