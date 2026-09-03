import type { Metadata } from "next";
import SettingsPageClient from "./page.client";
import { requireAuthenticatedUser } from "../../lib/auth.server";
export const metadata: Metadata = {
  title: "Settings — Shohoj Rin",
  description: "Manage your account details, security, and account status.",
};
export default async function Page() {
  const user = await requireAuthenticatedUser();
  return <SettingsPageClient user={user} />;
}
