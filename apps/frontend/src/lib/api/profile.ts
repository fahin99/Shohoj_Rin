import { apiRequest } from "../api";
import type { ProfileCompletionItem } from "@shohojrin/shared";

export async function getProfile() {
  return apiRequest<any>("/profile");
}

export async function updateProfile(data: Record<string, any>) {
  return apiRequest<any>("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getProfileCompletion() {
  return apiRequest<{ items: ProfileCompletionItem[]; status: string }>("/profile/completion");
}

export async function submitForVerification() {
  return apiRequest<any>("/profile/submit-verification", { method: "POST" });
}
