import type { Metadata } from "next";
import LoanDetailsPageClient from "./page.client";
import { requireAuthenticatedUser } from "../../../lib/auth.server";

export const metadata: Metadata = {
  title: "Loan details and repayment estimate",
  description:
    "Full terms, eligibility, fees and an estimated repayment schedule before you apply.",
  openGraph: {
    title: "Loan details and repayment estimate",
    description:
      "Full terms, eligibility, fees and an estimated repayment schedule before you apply.",
  },
};

export default async function Page() {
  await requireAuthenticatedUser();
  return <LoanDetailsPageClient />;
}
