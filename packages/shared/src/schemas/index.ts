import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(50, "Username must be at most 50 characters")
  .regex(
    /^[a-zA-Z0-9_.-]+$/,
    "Username can only contain letters, numbers, dots, underscores, or hyphens",
  );

export const registerSchema = z.object({
  username: usernameSchema,
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().trim().min(5).optional().nullable(),
  role: z.enum(["borrower", "lender"]).optional().default("borrower"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const loanApplicationSchema = z.object({
  requestedAmount: z.number().positive("Amount must be positive"),
  durationMonths: z.number().int().positive("Duration must be a positive number of months"),
  purpose: z.string().min(1, "Purpose is required"),
  purposeDescription: z.string().optional(),
  partnerId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  disbursementAccountId: z.string().uuid().optional(),
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

export const usernameUpdateSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username can only contain letters, numbers, dots, underscores, or hyphens",
    ),
});

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username can only contain letters, numbers, dots, underscores, or hyphens",
    )
    .optional(),
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
  monthlySavings: z.number().optional(),
  incomeSource: z.string().optional(),
  institutionId: z.string().uuid().optional().nullable(),
  studentId: z.string().optional(),
  enrollmentYear: z.number().int().optional(),
});

export const investorProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters")
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username can only contain letters, numbers, dots, underscores, or hyphens",
    )
    .optional(),
  displayName: z.string().trim().min(2).optional(),
  phone: z.string().trim().min(5).optional(),
  partnerAgentId: z.string().uuid().optional().nullable(),
  fundingCapacity: z.number().positive().optional(),
  preferredCategories: z.array(z.string()).optional(),
  riskPreference: z.enum(["conservative", "moderate", "aggressive"]).optional(),
  maxExposure: z.number().positive().optional(),
  investmentGoals: z.string().trim().optional(),
  companyName: z.string().trim().min(2).optional(),
  companyAddress: z.string().trim().optional(),
  companyBranch: z.string().trim().optional(),
  companyGoal: z.string().trim().optional(),
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

export const paymentAccountTypeSchema = z.enum(["mobile_money", "bank"]);
export const paymentProviderSchema = z.enum(["bkash", "nagad", "rocket", "bank"]);

export const createPaymentAccountSchema = z
  .object({
    accountType: paymentAccountTypeSchema,
    provider: paymentProviderSchema,
    accountName: z.string().trim().min(2, "Account name must be at least 2 characters").max(255),
    accountNumber: z
      .string()
      .trim()
      .min(5, "Account number must be at least 5 characters")
      .max(100),
    bankName: z.string().trim().max(255).optional().nullable(),
    branchName: z.string().trim().max(255).optional().nullable(),
    isDefault: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (data.accountType === "bank") {
        return !!data.bankName && data.bankName.trim().length > 0;
      }
      return true;
    },
    {
      message: "Bank name is required for bank accounts",
      path: ["bankName"],
    },
  )
  .refine(
    (data) => {
      if (data.accountType === "mobile_money") {
        return ["bkash", "nagad", "rocket"].includes(data.provider);
      }
      if (data.accountType === "bank") {
        return data.provider === "bank";
      }
      return false;
    },
    {
      message: "Invalid provider for account type",
      path: ["provider"],
    },
  );

export const updatePaymentAccountSchema = z
  .object({
    accountName: z.string().trim().min(2).max(255).optional(),
    accountNumber: z.string().trim().min(5).max(100).optional(),
    bankName: z.string().trim().max(255).optional().nullable(),
    branchName: z.string().trim().max(255).optional().nullable(),
    isDefault: z.boolean().optional(),
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LoanApplicationInput = z.infer<typeof loanApplicationSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DashboardSearch = z.infer<typeof dashboardSearchSchema>;
export type LoanListSearch = z.infer<typeof loanListSearchSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type InvestorProfileInput = z.infer<typeof investorProfileSchema>;
export type UsernameUpdateInput = z.infer<typeof usernameUpdateSchema>;
export type DocumentUploadInput = z.infer<typeof documentUploadSchema>;
export type VerificationRequestInput = z.infer<typeof verificationRequestSchema>;
export type CreatePaymentAccountInput = z.infer<typeof createPaymentAccountSchema>;
export type UpdatePaymentAccountInput = z.infer<typeof updatePaymentAccountSchema>;
