import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { StoredUserProfile } from "./session";
const configuredApiBaseUrl =
  process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
const API_BASE_URL = (
  configuredApiBaseUrl && /^https?:\/\//.test(configuredApiBaseUrl)
    ? configuredApiBaseUrl
    : "http://localhost:5000/api/v1"
).replace(/\/$/, "");
type BackendUser = {
  userId: string;
  username?: string | null;
  email: string;
  phone: string | null;
  role: string;
  accountStatus: string;
  emailVerified: boolean;
  profileCompletionStatus?: string | null;
  createdAt?: string;
  updatedAt?: string;
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
    profilePhotoUrl?: string | null;
  };
};
type MeResponse = {
  success: boolean;
  data?: { user?: BackendUser };
};
function toStoredUser(user: BackendUser): StoredUserProfile {
  return {
    userId: user.userId,
    username: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    accountStatus: user.accountStatus,
    emailVerified: user.emailVerified,
    profileCompletionStatus: user.profileCompletionStatus,
    profile: user.profile
      ? {
          fullName: user.profile.fullName,
          dateOfBirth: user.profile.dateOfBirth,
          gender: user.profile.gender,
          city: user.profile.city,
          district: user.profile.district,
          occupation: user.profile.occupation,
          nidNumber: user.profile.nidNumber,
          addressLine: user.profile.addressLine,
          postalCode: user.profile.postalCode,
          monthlyFamilyIncome: user.profile.monthlyFamilyIncome,
          employmentType: user.profile.employmentType,
          employerName: user.profile.employerName,
          monthlyIncome: user.profile.monthlyIncome,
          incomeSource: user.profile.incomeSource,
          studentId: user.profile.studentId,
          enrollmentYear: user.profile.enrollmentYear,
          institutionId: user.profile.institutionId,
          profilePhotoUrl: user.profile.profilePhotoUrl,
        }
      : undefined,
  };
}
export async function getCurrentUser(): Promise<StoredUserProfile | null> {
  const cookieStore = await cookies();
  if (!cookieStore.has("shohojrin_access_token")) {
    return null;
  }
  const cookieHeader = cookieStore.toString();
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const payload = (await response.json()) as MeResponse;
    return payload.data?.user ? toStoredUser(payload.data.user) : null;
  } catch {
    return null;
  }
}
export async function requireAuthenticatedUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/auth");
  }
  return user;
}
