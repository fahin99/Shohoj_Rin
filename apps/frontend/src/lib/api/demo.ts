import { apiRequest } from "../api";

export async function getDemoStatus() {
  return apiRequest<{ demoMode: boolean }>("/demo/status");
}

export async function skipDocuments() {
  return apiRequest<any>("/demo/skip-documents", { method: "POST" });
}
