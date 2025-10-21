"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/shared/hooks/use-auth";
import { useToast } from "@/shared/hooks/use-toast";
import {
  loginSchema,
  type LoginFormData,
  handleAuthError,
  handleAuthSuccess,
  getRedirectUrl,
  getLoadingText,
} from "../../utils";
import { AuthInput, PasswordInput, AuthButton } from "../ui";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export function LoginForm({
  onSuccess,
  redirectTo,
  className = "",
}: LoginFormProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearErrors();

    try {
      await login(data.email, data.password);

      handleAuthSuccess("login", toast);

      // Handle redirect
      const redirect = redirectTo || getRedirectUrl(searchParams, "/");

      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirect);
      }
    } catch (error) {
      const errorType = handleAuthError(error, toast);

      // Set specific field errors based on error type
      if (errorType === "email") {
        setError("email", { message: "Invalid email address" });
      } else if (errorType === "password" || errorType === "credentials") {
        setError("password", { message: "Invalid email or password" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 ${className}`}
    >
      {/* Email Field */}
      <AuthInput
        {...register("email", {
          onChange: () => clearErrors("email"),
        })}
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        required
        disabled={isSubmitting}
      />

      {/* Password Field */}
      <PasswordInput
        {...register("password", {
          onChange: () => clearErrors("password"),
        })}
        label="Password"
        placeholder="Enter your password"
        error={errors.password?.message}
        required
        disabled={isSubmitting}
      />

      {/* Submit Button */}
      <AuthButton
        type="submit"
        loading={isSubmitting}
        loadingText={getLoadingText("login")}
        fullWidth
        className="mt-6"
      >
        <div className="flex items-center">
          Sign In
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </AuthButton>

      {/* Footer Links */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-medium"
          >
            Create one here
          </Link>
        </p>

        <div className="pt-4 border-t">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Back to shopping
          </Link>
        </div>
      </div>
    </form>
  );
}
