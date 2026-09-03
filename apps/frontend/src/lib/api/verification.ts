import { apiRequest } from "../api";

interface VerificationRequestResult {
  request_id?: string;
  id?: string;
}

export async function createVerificationRequest(verificationType: string) {
  return apiRequest<VerificationRequestResult>("/verification/requests", {
    method: "POST",
    body: JSON.stringify({ verificationType }),
  });
}

export async function getVerificationRequests() {
  return apiRequest<unknown[]>("/verification/requests");
}

export async function getVerificationRequest(id: string) {
  return apiRequest<unknown>(`/verification/requests/${id}`);
}
