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
  email: string;
  phone: string | null;
  role: string;
  accountStatus: string;
  emailVerified: boolean;
  fullName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  city: string | null;
  district: string | null;
  occupation: string | null;
};
type MeResponse = {
  success: boolean;
  data?: { user?: BackendUser };
};
function toStoredUser(user: BackendUser): StoredUserProfile {
  return {
    userId: user.userId,
    email: user.email,
    phone: user.phone,
    role: user.role,
    accountStatus: user.accountStatus,
    emailVerified: user.emailVerified,
    profile: {
      fullName: user.fullName,
      dateOfBirth: user.dateOfBirth,
      gender: user.gender,
      city: user.city,
      district: user.district,
      occupation: user.occupation,
    },
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
