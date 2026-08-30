export interface StoredUserProfile {
  userId?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  accountStatus?: string;
  emailVerified?: boolean;
  profileCompletionStatus?: string;
  profile?: {
    fullName?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    city?: string | null;
    district?: string | null;
    occupation?: string | null;
    nidNumber?: string | null;
    addressLine?: string | null;
    postalCode?: string | null;
    monthlyFamilyIncome?: number | null;
    employmentType?: string | null;
    employerName?: string | null;
    monthlyIncome?: number | null;
    incomeSource?: string | null;
    studentId?: string | null;
    enrollmentYear?: number | null;
    institutionId?: string | null;
  };
}
export function getDisplayName(user: StoredUserProfile | null, fallback = "Account") {
  const fullName = user?.profile?.fullName?.trim();
  if (fullName) {
    return fullName;
  }
  if (user?.email) {
    return user.email.split("@")[0];
  }
  return fallback;
}
