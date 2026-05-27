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
  handleAuthSuccess,
  getRedirectUrl,
} from "../../utils";
import { AuthInput, PasswordInput, GoogleSignInButton } from "../ui";
import { ArrowRight, AlertCircle } from "lucide-react";
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
  const [formError, setFormError] = useState<string | null>(null);

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
    setFormError(null);

    try {
      await login(data.email, data.password);
      handleAuthSuccess("login", toast);
      const redirect = redirectTo || getRedirectUrl(searchParams, "/");
      if (onSuccess) onSuccess();
      else router.push(redirect);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";

      if (msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
        setFormError("Unable to connect to the server. Please check your internet connection.");
      } else if (
        msg.toLowerCase().includes("credentials") ||
        msg.toLowerCase().includes("invalid") ||
        msg.toLowerCase().includes("unauthorized") ||
        msg.toLowerCase().includes("401")
      ) {
        setFormError("Incorrect email or password. Please try again.");
        setError("password", { message: " " });
      } else if (msg.toLowerCase().includes("email")) {
        setFormError("No account found with that email address.");
        setError("email", { message: " " });
      } else {
        setFormError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-5 ${className}`}
    >
      {/* Inline error banner */}
      {formError && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="text-sm leading-snug">{formError}</span>
        </div>
      )}

      {/* Email Field */}
      <AuthInput
        {...register("email", {
          onChange: () => { clearErrors("email"); setFormError(null); },
        })}
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        required
        disabled={isSubmitting}
        className="!h-12 text-base"
      />

      {/* Password Field */}
      <PasswordInput
        {...register("password", {
          onChange: () => { clearErrors("password"); setFormError(null); },
        })}
        label="Password"
        placeholder="Enter your password"
        error={errors.password?.message}
        required
        disabled={isSubmitting}
        className="!h-12 text-base"
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 w-full h-12 text-base font-semibold text-white rounded-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{ background: "linear-gradient(135deg, #1a4a8a 0%, #4285F4 100%)" }}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            Signing in…
          </>
        ) : (
          <>
            Sign In
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>

      {/* OR divider */}
      <div className="relative my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Google Sign-In */}
      <GoogleSignInButton
        text="signin_with"
        onSuccess={() => router.push(redirectTo || "/")}
      />

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground pt-1">
        Don't have an account?{" "}
        <Link
          href="/register"
          className="text-blue-600 underline font-medium hover:text-blue-500 transition-colors"
        >
          Create one here
        </Link>
      </p>
    </form>
  );
}
