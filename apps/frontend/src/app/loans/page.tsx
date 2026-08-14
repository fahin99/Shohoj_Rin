import type { Metadata } from "next";
import LoansPageClient from "./page.client";

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

export default function Page() {
  return <LoansPageClient />;
}
