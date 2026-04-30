// ========================================
// API CONFIGURATION CONSTANTS
// ========================================

/**
 * Base URL for API requests
 * Falls back to localhost if environment variable not set
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const CONTACT = {
  phone: {
    display: "+961 03751903",
    tel: "+96103751903",
  },
  email: "hamdancomputers@gmail.com",
};
