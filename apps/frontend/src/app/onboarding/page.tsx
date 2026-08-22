import type { Metadata } from "next";
import OnboardingPageClient from "./page.client";
import { requireAuthenticatedUser } from "../../lib/auth.server";
export const metadata: Metadata = {
  title: "Set up your Shohoj Rin profile",
  description:
    "Tell us about your goals and income so we can match you with loans you actually qualify for.",
  openGraph: {
    title: "Set up your Shohoj Rin profile",
    description:
      "Tell us about your goals and income so we can match you with loans you actually qualify for.",
  },
};
export default async function Page() {
  await requireAuthenticatedUser();
  return <OnboardingPageClient />;
}
