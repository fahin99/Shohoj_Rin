import { apiRequest } from "../api";
import type { ProfileCompletionItem } from "@shohojrin/shared";

export interface ProfileData {
  full_name: string | null;
  date_of_birth: string | null;
  gender: string | null;
  nid_number: string | null;
  address_line: string | null;
  city: string | null;
  district: string | null;
  postal_code: string | null;
  occupation: string | null;
  monthly_family_income: number | string | null;
  institution_id: string | null;
  institution_name: string | null;
  student_id: string | null;
  enrollment_year: number | null;
  profile_photo_url: string | null;
  profile_completion_status: string | null;
  employment_type: string | null;
  employer_name: string | null;
  monthly_income: number | string | null;
  monthly_savings: number | string | null;
  income_source: string | null;
  email: string;
  phone: string | null;
  role: string;
}

export interface ProfileResponse {
  profile: ProfileData;
  completionItems?: ProfileCompletionItem[];
}

export async function getProfile() {
  return apiRequest<ProfileResponse>("/profile");
}

export async function updateProfile(data: Record<string, unknown>) {
  return apiRequest<ProfileData>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getProfileCompletion() {
  return apiRequest<{ items: ProfileCompletionItem[]; status: string }>("/profile/completion");
}

export async function submitForVerification() {
  return apiRequest<unknown>("/profile/submit-verification", { method: "POST" });
}
