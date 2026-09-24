import type { Metadata } from "next";
import { requireAdminUser } from "../../../lib/auth.server";
import DatabaseShowcasePageClient from "./page.client";

export const metadata: Metadata = {
  title: "Database showcase — Shohoj Rin",
  description: "Admin-only live PostgreSQL database showcase for Shohoj Rin.",
};

export default async function Page() {
  const user = await requireAdminUser();
  return <DatabaseShowcasePageClient user={user} />;
}
