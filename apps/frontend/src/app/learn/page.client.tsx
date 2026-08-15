"use client";

import FinancialEducation from "../../views/FinancialEducation";
import { useAppNavigate } from "../../lib/navigation";
import type { StoredUserProfile } from "../../lib/session";

export default function LearnPageClient({ user }: { user: StoredUserProfile | null }) {
  const navigate = useAppNavigate();
  return <FinancialEducation onNavigate={navigate} user={user} />;
}
