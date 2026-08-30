import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  role: z.enum(["borrower", "lender"]).optional().default("borrower"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const loanApplicationSchema = z.object({
  requestedAmount: z.number().positive("Amount must be positive"),
  purpose: z.string().min(1, "Purpose is required"),
  purposeDescription: z.string().optional(),
  partnerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().catch(1),
  limit: z.number().int().positive().max(100).catch(20),
});

export const dashboardSearchSchema = z.object({
  tab: z.enum(["overview", "loans", "repayments", "trust-score"]).catch("overview"),
  page: z.number().catch(1),
  status: z.enum(["all", "active", "pending", "completed"]).optional(),
});

export const loanListSearchSchema = z.object({
  page: z.number().catch(1),
  category: z
    .enum(["all", "education", "emergency", "business", "personal", "development"])
    .catch("all"),
  search: z.string().optional(),
  sort: z.enum(["interest-asc", "interest-desc", "amount-asc", "amount-desc"]).optional(),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nidNumber: z.string().optional(),
  addressLine: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  occupation: z.string().optional(),
  monthlyFamilyIncome: z.number().optional(),
  employmentType: z.string().optional(),
  employerName: z.string().optional(),
  monthlyIncome: z.number().optional(),
  incomeSource: z.string().optional(),
  institutionId: z.string().uuid().optional().nullable(),
  studentId: z.string().optional(),
  enrollmentYear: z.number().int().optional(),
});

export const investorProfileSchema = z.object({
  displayName: z.string().trim().min(2).optional(),
  fundingCapacity: z.number().positive().optional(),
  preferredCategories: z.array(z.string()).optional(),
  riskPreference: z.enum(["conservative", "moderate", "aggressive"]).optional(),
  maxExposure: z.number().positive().optional(),
});

export const documentUploadSchema = z.object({
  documentType: z.enum([
    "nid_front",
    "nid_back",
    "student_id",
    "tuition_receipt",
    "utility_bill",
    "income_proof",
    "address_proof",
    "nid",
    "tin_certificate",
    "trade_license",
    "incorporation_certificate",
    "regulatory_license",
    "other",
  ]),
  verificationRequestId: z.string().uuid().optional(),
});

export const verificationRequestSchema = z.object({
  verificationType: z.enum(["identity", "student", "income", "address", "document", "guarantor"]),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LoanApplicationInput = z.infer<typeof loanApplicationSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DashboardSearch = z.infer<typeof dashboardSearchSchema>;
export type LoanListSearch = z.infer<typeof loanListSearchSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type InvestorProfileInput = z.infer<typeof investorProfileSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type VerificationRequestInput = z.infer<typeof verificationRequestSchema>;
