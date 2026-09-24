"use client";

import { useAppNavigate } from "../../../lib/navigation";
import type { StoredUserProfile } from "../../../lib/session";
import DatabaseShowcase from "../../../views/DatabaseShowcase";

export default function DatabaseShowcasePageClient({ user }: { user: StoredUserProfile }) {
  return <DatabaseShowcase onNavigate={useAppNavigate()} user={user} />;
}
