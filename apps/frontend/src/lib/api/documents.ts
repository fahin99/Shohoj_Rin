import { apiRequest } from "../api";

export async function uploadDocument(data: {
  documentType: string;
  fileName: string;
  mimeType: string;
  fileData: string;
  verificationRequestId?: string;
}) {
  return apiRequest<unknown>("/documents/upload", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getDocuments() {
  return apiRequest<unknown[]>("/documents");
}

export async function getDocument(id: string) {
  return apiRequest<unknown>(`/documents/${id}`);
}

export async function deleteDocument(id: string) {
  return apiRequest<unknown>(`/documents/${id}`, { method: "DELETE" });
}
