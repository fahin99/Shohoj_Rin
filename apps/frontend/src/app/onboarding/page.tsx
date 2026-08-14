import type { Metadata } from "next";
import OnboardingPageClient from "./page.client";

export const metadata: Metadata = {
  title: "Set up your Shohoj_Rin profile",
  description:
    "Tell us about your goals and income so we can match you with loans you actually qualify for.",
  openGraph: {
    title: "Set up your Shohoj_Rin profile",
    description:
      "Tell us about your goals and income so we can match you with loans you actually qualify for.",
  },
};

export default function Page() {
  return <OnboardingPageClient />;
}
