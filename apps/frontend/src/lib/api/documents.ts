import { apiRequest } from "../api";

export async function uploadDocument(data: {
  documentType: string;
  fileName: string;
  mimeType: string;
  fileData: string; // base64
  verificationRequestId?: string;
}) {
  return apiRequest<any>("/documents/upload", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getDocuments() {
  return apiRequest<any[]>("/documents");
}

export async function getDocument(id: string) {
  return apiRequest<any>(`/documents/${id}`);
}

export async function deleteDocument(id: string) {
  return apiRequest<any>(`/documents/${id}`, { method: "DELETE" });
}
