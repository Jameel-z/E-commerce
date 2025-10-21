import { useToast } from "@/shared/hooks/use-toast";

// ========================================
// AUTH ERROR HANDLING
// ========================================

/**
 * Handle authentication errors consistently across forms
 */
export function handleAuthError(
  error: unknown,
  toast: ReturnType<typeof useToast>["toast"]
) {
  console.error("Auth error:", error);

  if (error instanceof Error) {
    // Handle specific API errors
    if (error.message.includes("email")) {
      toast({
        title: "Email Error",
        description: "This email address is already registered or invalid.",
        variant: "destructive",
      });
      return "email";
    }

    if (error.message.includes("password")) {
      toast({
        title: "Password Error",
        description: "Invalid password. Please check and try again.",
        variant: "destructive",
      });
      return "password";
    }

    if (error.message.includes("credentials")) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
      return "credentials";
    }

    // Generic error message
    toast({
      title: "Authentication Error",
      description:
        error.message || "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
    return "generic";
  }

  // Unknown error
  toast({
    title: "Error",
    description: "An unexpected error occurred. Please try again.",
    variant: "destructive",
  });
  return "unknown";
}

// ========================================
// REDIRECT HELPERS
// ========================================

/**
 * Get redirect URL after successful authentication
 */
export function getRedirectUrl(
  searchParams?: URLSearchParams,
  fallback: string = "/"
): string {
  const redirectTo = searchParams?.get("redirect");

  // Validate redirect URL to prevent open redirects
  if (redirectTo) {
    try {
      const url = new URL(redirectTo, window.location.origin);
      // Only allow same-origin redirects
      if (url.origin === window.location.origin) {
        return url.pathname + url.search;
      }
    } catch {
      // Invalid URL, use fallback
    }
  }

  return fallback;
}

/**
 * Create login redirect URL with current page as redirect target
 */
export function createLoginRedirect(currentPath?: string): string {
  const redirectPath = currentPath || window.location.pathname;
  const params = new URLSearchParams();

  if (redirectPath !== "/" && redirectPath !== "/login") {
    params.set("redirect", redirectPath);
  }

  return `/login${params.toString() ? `?${params.toString()}` : ""}`;
}

// ========================================
// FORM UTILITIES
// ========================================

/**
 * Clear form errors when user starts typing
 */
export function createFieldChangeHandler<T extends Record<string, any>>(
  fieldName: keyof T,
  errors: T,
  setErrors: (errors: T) => void
) {
  return () => {
    if (errors[fieldName]) {
      setErrors({
        ...errors,
        [fieldName]: undefined,
      });
    }
  };
}

/**
 * Generate loading text based on form type
 */
export function getLoadingText(
  formType: "login" | "register" | "profile" | "password"
): string {
  const loadingTexts = {
    login: "Signing in...",
    register: "Creating account...",
    profile: "Updating profile...",
    password: "Changing password...",
  };

  return loadingTexts[formType];
}

// ========================================
// VALIDATION UTILITIES
// ========================================

/**
 * Check if email domain is from common providers
 */
export function isCommonEmailProvider(email: string): boolean {
  const commonProviders = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "icloud.com",
    "protonmail.com",
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  return commonProviders.includes(domain);
}

/**
 * Generate password requirements text
 */
export function getPasswordRequirements(): string[] {
  return [
    "At least 8 characters long",
    "Contains uppercase and lowercase letters",
    "Contains at least one number",
    "No common passwords or personal information",
  ];
}

// ========================================
// SUCCESS HANDLERS
// ========================================

/**
 * Handle successful authentication with consistent messaging
 */
export function handleAuthSuccess(
  type: "login" | "register" | "profile" | "password",
  toast: ReturnType<typeof useToast>["toast"],
  userName?: string
) {
  const messages = {
    login: {
      title: `Welcome back${userName ? `, ${userName}` : ""}!`,
      description: "You have been logged in successfully.",
    },
    register: {
      title: "Account created successfully!",
      description: "Welcome to our platform. You are now logged in.",
    },
    profile: {
      title: "Profile updated!",
      description: "Your profile information has been saved successfully.",
    },
    password: {
      title: "Password changed!",
      description: "Your password has been updated successfully.",
    },
  };

  const message = messages[type];
  toast({
    title: message.title,
    description: message.description,
    variant: "default",
  });
}
