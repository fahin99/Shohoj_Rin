import type { Metadata } from "next";
import LearnPageClient from "./page.client";
import { getCurrentUser } from "../../lib/auth.server";
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
export default async function Page() {
  const user = await getCurrentUser();
  return <LearnPageClient user={user} />;
}
