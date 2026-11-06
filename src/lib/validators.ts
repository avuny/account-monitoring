import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const addEmailSchema = z.object({
  address: z.string().trim().toLowerCase().email("Enter a valid email address").max(255),
});

const quota = z.number().int().min(0).max(100).nullable();
const resetAt = z.string().datetime({ offset: true }).nullable();

export const createAccountSchema = z.object({
  emailId: z.string().uuid(),
  name: z.string().trim().min(1, "Account name is required").max(100),
  quotaPercent: quota.optional(),
  resetAt: resetAt.optional(),
});

export const updateAccountSchema = z.object({
  name: z.string().trim().min(1, "Account name is required").max(100).optional(),
  quotaPercent: quota.optional(),
  resetAt: resetAt.optional(),
});
