import type { Metadata } from "next";
import ProfilePageClient from "./page.client";
import { requireAuthenticatedUser } from "../../lib/auth.server";

export const metadata: Metadata = {
  title: "Your profile — Shohoj Rin",
  description: "View and update your Shohoj Rin profile, trust score, and account details.",
};

export default async function Page() {
  const user = await requireAuthenticatedUser();
  return <ProfilePageClient user={user} />;
}
