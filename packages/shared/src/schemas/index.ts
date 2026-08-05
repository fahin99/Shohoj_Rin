import { z } from "zod";

// Auth schemas

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Loan application schemas

export const loanApplicationSchema = z.object({
  requestedAmount: z.number().positive("Amount must be positive"),
  purpose: z.string().min(1, "Purpose is required"),
  purposeDescription: z.string().optional(),
  partnerId: z.string().uuid().optional(),
});

// Search / filter schemas (for type-safe TanStack Router search params)

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
  category: z.enum(["all", "education", "emergency", "business", "personal", "development"]).catch("all"),
  search: z.string().optional(),
  sort: z.enum(["interest-asc", "interest-desc", "amount-asc", "amount-desc"]).optional(),
});

// Type exports from schemas

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LoanApplicationInput = z.infer<typeof loanApplicationSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DashboardSearch = z.infer<typeof dashboardSearchSchema>;
export type LoanListSearch = z.infer<typeof loanListSearchSchema>;
