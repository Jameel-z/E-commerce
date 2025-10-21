// ========================================
// AUTH TYPE DEFINITIONS
// ========================================

/**
 * User interface - matches backend schemas/user.py User schema
 */
export interface User {
  id: number;
  name: string | null;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * User Registration Request
 */
export interface UserRegistrationRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// ========================================
// FORM TYPES
// ========================================

/**
 * Form submission states
 */
export interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
}

/**
 * Auth form props interface
 */
export interface AuthFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

/**
 * Login form specific props
 */
export interface LoginFormProps extends AuthFormProps {
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
}

/**
 * Register form specific props
 */
export interface RegisterFormProps extends AuthFormProps {
  showTermsAcceptance?: boolean;
  autoLogin?: boolean;
}

/**
 * Profile form specific props
 */
export interface ProfileFormProps extends AuthFormProps {
  initialData?: {
    name: string;
    email: string;
  };
}
