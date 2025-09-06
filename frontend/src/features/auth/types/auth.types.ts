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
