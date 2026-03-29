import { z } from "zod";

//////////////////////////////
// COMMON VALIDATIONS
//////////////////////////////

const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "Name must be at least 2 characters" })
  .max(120, { message: "Name too long" });

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: "Invalid email address" });

const passwordSchema = z
  .string()
  .trim()
  .min(6, { message: "Password must be at least 6 characters" })
  .max(100)
  .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Must contain at least one number" });

const organizationSchema = z
  .string()
  .trim()
  .min(2, { message: "Organization name required" })
  .max(150);

//////////////////////////////
// AUTH SCHEMAS
//////////////////////////////

//  Register (Doctor / Admin creation)
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  organizationName: organizationSchema,
});

//  Login
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().trim().min(1, { message: "Password is required" }),
});

//////////////////////////////
// OPTIONAL (FUTURE READY)
// OTP + ADVANCED AUTH
//////////////////////////////

const otpSchema = z
  .string()
  .trim()
  .length(6, { message: "OTP must be 6 digits" })
  .regex(/^\d{6}$/, { message: "OTP must be numeric" });

//  Request OTP (future mobile/email login)
export const requestOtpSchema = z.object({
  email: emailSchema,
});

//  Verify OTP login
export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema,
});

//////////////////////////////
// TYPES (VERY IMPORTANT )
//////////////////////////////

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type RequestOtpBody = z.infer<typeof requestOtpSchema>;
export type VerifyOtpBody = z.infer<typeof verifyOtpSchema>;