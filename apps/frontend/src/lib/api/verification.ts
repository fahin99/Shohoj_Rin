import { apiRequest } from "../api";

export async function createVerificationRequest(verificationType: string) {
  return apiRequest<any>("/verification/requests", {
    method: "POST",
    body: JSON.stringify({ verificationType }),
  });
}

export async function getVerificationRequests() {
  return apiRequest<any[]>("/verification/requests");
}

export async function getVerificationRequest(id: string) {
  return apiRequest<any>(`/verification/requests/${id}`);
}
