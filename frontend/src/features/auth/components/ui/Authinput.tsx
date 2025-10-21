"use client";

import { forwardRef } from "react";
import Input from "@/shared/components/ui/input";
import Label from "@/shared/components/ui/label";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, required, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Input
          id={inputId}
          ref={ref}
          className={`${error ? "border-destructive" : ""} ${className || ""}`}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
