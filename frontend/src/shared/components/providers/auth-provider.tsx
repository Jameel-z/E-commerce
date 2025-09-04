"use client";

import type { ReactNode } from "react";
import { AuthContext, useAuthProvider } from "@/shared/hooks/use-auth";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuthProvider();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
