"use client";
import SettingsPage from "../../views/SettingsPage";
import { useAppNavigate } from "../../lib/navigation";
import type { StoredUserProfile } from "../../lib/session";
export default function SettingsPageClient({ user }: { user: StoredUserProfile }) {
  const navigate = useAppNavigate();
  return <SettingsPage onNavigate={navigate} user={user} />;
}
