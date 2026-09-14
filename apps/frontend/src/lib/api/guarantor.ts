import { apiRequest } from "../api";

export interface GuarantorData {
  guarantorId: string;
  fullName: string;
  relationship: string;
  phone: string | null;
  email: string | null;
  nidNumber: string | null;
  address: string | null;
  isVerified: boolean;
  createdAt: string;
}

export interface GuarantorUpdateInput {
  fullName: string;
  relationship: string;
  phone?: string;
  email?: string;
  nidNumber?: string;
  address?: string;
}

export async function getGuarantor() {
  return apiRequest<GuarantorData | null>("/guarantor");
}

export async function updateGuarantor(data: GuarantorUpdateInput) {
  return apiRequest<GuarantorData>("/guarantor", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
