"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/shared/hooks/use-auth";
import { useToast } from "@/shared/hooks/use-toast";
import {
  registerSchema,
  type RegisterFormData,
  handleAuthSuccess,
  getRedirectUrl,
} from "../../utils";
import { AuthInput, PasswordInput, GoogleSignInButton } from "../ui";
import { ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/shared/components/ui/checkbox";

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export function RegisterForm({
  onSuccess,
  redirectTo,
  className = "",
}: RegisterFormProps) {
  const { register: registerUser } = useAuth();
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
    watch,
    setValue, // Add this line
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const password = watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    clearErrors();
    setFormError(null);

    try {
      await registerUser(data.name, data.email, data.password);
      handleAuthSuccess("register", toast);
      const redirect = redirectTo || getRedirectUrl(searchParams, "/");
      if (onSuccess) onSuccess();
      else router.push(redirect);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      const lower = msg.toLowerCase();

      if (lower.includes("fetch") || lower.includes("network")) {
        setFormError("Unable to connect to the server. Please check your internet connection.");
      } else if (lower.includes("already") || lower.includes("email") || lower.includes("exists")) {
        setFormError("An account with this email already exists. Try signing in instead.");
        setError("email", { message: " " });
      } else if (lower.includes("password")) {
        setFormError("Password does not meet the requirements. Please choose a stronger password.");
        setError("password", { message: " " });
      } else if (lower.includes("422") || lower.includes("validation")) {
        setFormError("Please check your information and try again.");
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
      className={`space-y-4 ${className}`}
    >
      {/* Inline error banner */}
      {formError && (
        <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span className="text-sm leading-snug">{formError}</span>
        </div>
      )}

      {/* Name Field */}
      <AuthInput
        {...register("name", { onChange: () => { clearErrors("name"); setFormError(null); } })}
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        error={errors.name?.message}
        required
        disabled={isSubmitting}
        className="!h-11 text-base"
      />

      {/* Email Field */}
      <AuthInput
        {...register("email", { onChange: () => { clearErrors("email"); setFormError(null); } })}
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        error={errors.email?.message}
        required
        disabled={isSubmitting}
        autoComplete="off"
        className="!h-11 text-base"
      />

      {/* Password Field */}
      <PasswordInput
        {...register("password", { onChange: () => { clearErrors("password"); setFormError(null); } })}
        label="Password"
        placeholder="Create a secure password"
        error={errors.password?.message}
        required
        disabled={isSubmitting}
        showStrength={true}
        value={password}
        autoComplete="new-password"
        className="!h-11 text-base"
      />

      {/* Confirm Password Field */}
      <PasswordInput
        {...register("confirmPassword", { onChange: () => { clearErrors("confirmPassword"); setFormError(null); } })}
        label="Confirm Password"
        placeholder="Confirm your password"
        error={errors.confirmPassword?.message}
        required
        disabled={isSubmitting}
        className="!h-11 text-base"
      />

      {/* Terms Checkbox */}
      <div className="flex items-start space-x-2.5 pt-1">
        <Checkbox
          id="terms"
          checked={watch("terms") || false}
          onCheckedChange={(checked) => {
            setValue("terms", checked as boolean);
            if (checked) clearErrors("terms");
          }}
          className="mt-0.5"
        />
        <label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
          I agree to the{" "}
          <Link href="/terms" className="text-blue-600 underline hover:text-blue-500 transition-colors" target="_blank">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-600 underline hover:text-blue-500 transition-colors" target="_blank">
            Privacy Policy
          </Link>
        </label>
      </div>
      {errors.terms && (
        <p className="text-sm text-destructive">{errors.terms.message}</p>
      )}

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
            Creating account…
          </>
        ) : (
          <>
            Create Account
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
          <span className="bg-white dark:bg-slate-800 px-3 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Google Sign-Up */}
      <GoogleSignInButton
        text="signup_with"
        onSuccess={() => router.push(redirectTo || "/")}
      />

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground pt-1">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 underline font-medium hover:text-blue-500 transition-colors">
          Sign in here
        </Link>
      </p>
    </form>
  );
}
