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
    setUser(userData);

    // Merge guest cart if exists
    try {
      await apiClient.mergeCart();
    } catch (error) {
      // Cart merge failed, but login succeeded
      console.warn("Failed to merge cart:", error);
    }
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
    isAdmin: user?.is_admin || false,
  };
}

export { AuthContext };
