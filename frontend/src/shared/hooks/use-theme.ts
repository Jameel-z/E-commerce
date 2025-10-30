import { useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  // Default to "system" to follow browser preference
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "system";
    }
    return "system";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      // If theme is "system", use browser preference; otherwise, use selected theme
      const effectiveTheme =
        theme === "system" ? (mediaQuery.matches ? "dark" : "light") : theme;
      document.documentElement.classList.toggle(
        "dark",
        effectiveTheme === "dark"
      );
    };

    // Apply theme on mount and when theme/mediaQuery changes
    applyTheme();

    // Listen for browser theme changes
    mediaQuery.addEventListener("change", applyTheme);

    // Cleanup
    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme]);

  return { theme, setTheme };
}
