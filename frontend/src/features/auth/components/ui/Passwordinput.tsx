"use client";

import { useState, forwardRef } from "react";
import { Button } from "@/shared/components/ui/button";
import Input from "@/shared/components/ui/input";
import Label from "@/shared/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  required?: boolean;
  showStrength?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      required,
      showStrength = false,
      className,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

    // Password strength calculation
    const getPasswordStrength = (): {
      level: number;
      text: string;
      color: string;
    } => {
      const password = (value as string) || "";
      if (!password || !showStrength) return { level: 0, text: "", color: "" };

      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;

      const levels = [
        { level: 0, text: "", color: "" },
        { level: 1, text: "Very Weak", color: "text-red-500" },
        { level: 2, text: "Weak", color: "text-orange-500" },
        { level: 3, text: "Fair", color: "text-yellow-500" },
        { level: 4, text: "Good", color: "text-blue-500" },
        { level: 5, text: "Strong", color: "text-green-500" },
      ];

      return levels[strength];
    };

    const passwordStrength = getPasswordStrength();

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="relative">
          <Input
            id={inputId}
            ref={ref}
            type={showPassword ? "text" : "password"}
            value={value}
            className={`${error ? "border-destructive pr-10" : "pr-10"} ${
              className || ""
            }`}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Password Strength Indicator */}
        {showStrength && value && (
          <div className="flex items-center justify-between text-xs">
            <span className={`font-medium ${passwordStrength.color}`}>
              {passwordStrength.text}
            </span>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`h-1 w-6 rounded-full ${
                    level <= passwordStrength.level
                      ? passwordStrength.level <= 2
                        ? "bg-red-500"
                        : passwordStrength.level <= 3
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
