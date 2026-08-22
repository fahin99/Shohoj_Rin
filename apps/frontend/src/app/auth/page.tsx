import type { Metadata } from "next";
import AuthPageClient from "./page.client";
import { getCurrentUser } from "../../lib/auth.server";
import { redirect } from "next/navigation";
export const metadata: Metadata = {
  title: "Log in or create your Shohoj Rin account",
  description:
    "Sign in to track loans and repayments, or register in minutes to start exploring loan options.",
  openGraph: {
    title: "Log in or create your Shohoj Rin account",
    description:
      "Sign in to track loans and repayments, or register in minutes to start exploring loan options.",
  },
};
export default async function Page() {
  if (await getCurrentUser()) {
    redirect("/dashboard");
  }
  return <AuthPageClient />;
}
