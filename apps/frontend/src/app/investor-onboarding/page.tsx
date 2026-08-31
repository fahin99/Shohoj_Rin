import type { Metadata } from "next";
import InvestorOnboardingPageClient from "./page.client";
import { requireAuthenticatedUser } from "../../lib/auth.server";
export const metadata: Metadata = {
  title: "Set up your Shohoj Rin investor profile",
  description:
    "Tell us about your funding capacity and risk preferences so we can match you with borrowers.",
  openGraph: {
    title: "Set up your Shohoj Rin investor profile",
    description:
      "Tell us about your funding capacity and risk preferences so we can match you with borrowers.",
  },
};
export default async function Page() {
  await requireAuthenticatedUser();
  return <InvestorOnboardingPageClient />;
}