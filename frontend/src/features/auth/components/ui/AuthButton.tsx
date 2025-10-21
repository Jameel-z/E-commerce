"use client";

import { Button } from "@/shared/components/ui/button";
import { ReactNode } from "react";

interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: ReactNode;
  variant?: "default" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function AuthButton({
  loading = false,
  loadingText = "Loading...",
  children,
  variant = "default",
  size = "md",
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: AuthButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={loading || disabled}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          {loadingText}
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
