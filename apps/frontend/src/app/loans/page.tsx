import type { Metadata } from "next";
import LoansPageClient from "./page.client";
import { requireAuthenticatedUser } from "../../lib/auth.server";
export const metadata: Metadata = {
  title: "Loan marketplace — compare loans clearly",
  description:
    "Browse and compare education, emergency, business and personal loans with transparent rates and terms.",
  openGraph: {
    title: "Loan marketplace — compare loans clearly",
    description:
      "Browse and compare education, emergency, business and personal loans with transparent rates and terms.",
  },
};
export default async function Page() {
  await requireAuthenticatedUser();
  return <LoansPageClient />;
}
