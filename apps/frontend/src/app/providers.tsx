import { UserProvider } from "../lib/user-context";
import type { StoredUserProfile } from "../lib/session";

export function Providers({
  user,
  children,
}: {
  user: StoredUserProfile | null;
  children: React.ReactNode;
}) {
  return <UserProvider user={user}>{children}</UserProvider>;
}