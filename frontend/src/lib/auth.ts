// src/lib/auth.ts
import { cookies } from "next/headers";
import { apiClient } from "./types/apiClient";

export const getAuthToken = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
};

export const setAuthToken = async (token: string): Promise<void> => {
  try {
    const response = await fetch("/api/auth/set-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error("Failed to set auth token");
    }
  } catch (error) {  
    console.error("Error setting auth token:", error);
    throw error; // Re-throw to let calling code handle it
  }
};

export const clearAuthToken = async (): Promise<void> => {
  try {
    await fetch("/api/auth/clear-token", {
      method: "POST",
    });
  } catch (error) {
    console.error("Error clearing auth token:", error);
    throw error;
  }
};

export const verifyToken = async (): Promise<boolean> => {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch("/api/auth/validate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    return response.ok;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

export const verifyTokenViaAPI = async (token: string): Promise<boolean> => {
  if (!token) return false;

  try {
    const response = await fetch("/api/auth/validate-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });

    const { valid } = await response.json();
    return valid;
  } catch (error) {
    console.error("Token verification API error:", error);
    return false;
  }
};

export const getUserViaAPI = async (token: string) => {
  try {
    const response = await apiClient.getCurrentUser(token);

    // Validate response structure
    if (!response || typeof response !== "object") {
      throw new Error("Invalid user data response");
    }

    return {
      id: response.id,
      email: response.email,
      is_admin: response.is_admin ?? false, // Default to false if undefined
    };
  } catch (error) {
    console.error(
      "Failed to fetch user via API:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
};
