"use client";

import LandingPage from "../views/LandingPage";
import { useAppNavigate } from "../lib/navigation";
import type { StoredUserProfile } from "../lib/session";

export default function LandingPageClient({ user }: { user: StoredUserProfile | null }) {
  const navigate = useAppNavigate();
  return <LandingPage onNavigate={navigate} user={user} />;
}
