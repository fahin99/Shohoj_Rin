export interface StoredUserProfile {
  userId?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  accountStatus?: string;
  emailVerified?: boolean;
  profile?: {
    fullName?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    city?: string | null;
    district?: string | null;
    occupation?: string | null;
  };
}

export function getDisplayName(user: StoredUserProfile | null, fallback: string) {
  const fullName = user?.profile?.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  if (user?.email) {
    return user.email.split("@")[0];
  }

  return fallback;
}
