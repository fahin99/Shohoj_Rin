import type { Metadata } from "next";
import LearnPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Financial education — learn before you borrow",
  description:
    "Plain-language guides on interest, repayment, credit and budgeting, plus a loan cost calculator.",
  openGraph: {
    title: "Financial education — learn before you borrow",
    description:
      "Plain-language guides on interest, repayment, credit and budgeting, plus a loan cost calculator.",
  },
};

export default function Page() {
  return <LearnPageClient />;
}
