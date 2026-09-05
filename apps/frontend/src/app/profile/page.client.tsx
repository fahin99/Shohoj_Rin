"use client";
import ProfilePage from "../../views/ProfilePage";
import { useAppNavigate } from "../../lib/navigation";
import type { StoredUserProfile } from "../../lib/session";

export default function ProfilePageClient({ user }: { user: StoredUserProfile }) {
  const navigate = useAppNavigate();
  return <ProfilePage onNavigate={navigate} user={user} />;
}
