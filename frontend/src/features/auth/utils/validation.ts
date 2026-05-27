import { z } from "zod";

// ========================================
// DISPOSABLE EMAIL BLOCKLIST
// ========================================
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
  "guerrillamail.de", "guerrillamail.biz", "guerrillamail.info",
  "temp-mail.org", "tempmail.com", "throwam.com", "throwaway.email",
  "fakeinbox.com", "sharklasers.com", "spam4.me", "yopmail.com", "yopmail.fr",
  "trashmail.com", "trashmail.me", "trashmail.at", "trashmail.io",
  "dispostable.com", "mailnull.com", "maildrop.cc", "discard.email",
  "spamex.com", "jetable.fr.nf", "nomail.xl.cx", "superrito.com",
  "spamfree24.org", "mail-temporaire.fr", "wegwerfmail.de", "wegwerfmail.net",
  "10minutemail.com", "10minutemail.net", "10minutemail.org",
  "20minutemail.com", "mytemp.email", "tempr.email", "mailtemp.info",
  "tempail.com", "mohmal.com", "mailnesia.com", "binkmail.com", "bob.email",
]);

function isDisposableEmail(email: string): boolean {
  const domain = email.toLowerCase().split("@")[1] ?? "";
  return DISPOSABLE_DOMAINS.has(domain);
}

// ========================================
// VALIDATION SCHEMAS
// ========================================

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

/**
 * Registration form validation schema
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address")
      .refine((v) => !isDisposableEmail(v), {
        message: "Disposable email addresses are not allowed. Please use a real email.",
      }),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/(?=.*\d)/, "Password must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Profile update validation schema
 */
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

/**
 * Password change validation schema
 */
export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "Password must be at least 8 characters")
      .regex(
        /(?=.*[a-z])/,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        /(?=.*[A-Z])/,
        "Password must contain at least one uppercase letter"
      )
      .regex(/(?=.*\d)/, "Password must contain at least one number"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

/**
 * Combined profile form validation schema (for ProfileForm component)
 * Handles both profile updates and optional password changes
 */
export const profileSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z.string().email("Please enter a valid email address"), // Display only, not validated for changes
    currentPassword: z.string().optional(), // Keep for form compatibility
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If new password is provided, confirmation is required
      if (data.newPassword) {
        return data.confirmNewPassword;
      }
      return true;
    },
    {
      message: "Please confirm your new password",
      path: ["confirmNewPassword"],
    }
  )
  .refine(
    (data) => {
      // If new password is provided, passwords must match
      if (data.newPassword && data.confirmNewPassword) {
        return data.newPassword === data.confirmNewPassword;
      }
      return true;
    },
    {
      message: "Passwords don't match",
      path: ["confirmNewPassword"],
    }
  )
  .refine(
    (data) => {
      // New password must meet strength requirements if provided
      if (data.newPassword) {
        return (
          data.newPassword.length >= 8 &&
          /[a-z]/.test(data.newPassword) &&
          /[A-Z]/.test(data.newPassword) &&
          /\d/.test(data.newPassword)
        );
      }
      return true;
    },
    {
      message:
        "Password must be at least 8 characters with uppercase, lowercase, and number",
      path: ["newPassword"],
    }
  );

// ========================================
// TYPE EXPORTS
// ========================================

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;

// ========================================
// VALIDATION HELPERS
// ========================================

/**
 * Password strength calculator
 */
export function calculatePasswordStrength(password: string): {
  level: number;
  text: string;
  color: string;
} {
  if (!password) return { level: 0, text: "", color: "" };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = [
    { level: 0, text: "", color: "" },
    { level: 1, text: "Very Weak", color: "text-red-500" },
    { level: 2, text: "Weak", color: "text-orange-500" },
    { level: 3, text: "Fair", color: "text-yellow-500" },
    { level: 4, text: "Good", color: "text-blue-500" },
    { level: 5, text: "Strong", color: "text-green-500" },
  ];

  return levels[strength];
}

/**
 * Extract validation errors for display
 */
export function getValidationErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  error.issues.forEach((err) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });

  return errors;
}

/**
 * Terms and conditions validation
 */
export const termsSchema = z.boolean().refine((val) => val === true, {
  message: "You must accept the terms and conditions",
});
