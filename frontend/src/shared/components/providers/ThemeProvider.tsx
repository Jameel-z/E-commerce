"use client";

import { useEffect } from "react";
import { useTheme } from "@/shared/hooks/use-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  // The useTheme hook already handles applying the theme class
  // This component just ensures the hook runs at the app level

  return <>{children}</>;
}
