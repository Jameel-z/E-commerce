"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { apiClient, type User } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  updateProfile: (data: { name: string; email?: string }) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useAuthProvider() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      apiClient
        .getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("access_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    await apiClient.login(username, password);
    const userData = await apiClient.getCurrentUser();

    // Merge guest cart with user cart (now properly implemented!)
    try {
      await apiClient.mergeCart();
      console.log("Cart merge completed successfully");
    } catch (error) {
      // Cart merge failed, but login succeeded - this is okay
      console.warn("Failed to merge cart, but login succeeded:", error);
    }

    // Set user after cart operations are complete
    setUser(userData);
  };

  const register = async (name: string, email: string, password: string) => {
    const registrationData = {
      name,
      email,
      password,
    };
    await apiClient.register(registrationData);
    // Auto-login after registration
    await login(email, password);
  };

  const updateProfile = async (data: { name: string; email?: string }) => {
    // Note: backend doesn't support email updates, so we'll only send name
    const updatedUser = await apiClient.updateCurrentUser({ name: data.name });
    setUser(updatedUser);
  };

  const updatePassword = async (newPassword: string) => {
    await apiClient.updateCurrentUser({ password: newPassword });
    // No need to update user state for password change
  };

  const logout = () => {
    apiClient.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updatePassword,
    isAdmin: user?.is_admin || false,
  };
}

export { AuthContext };
