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
  getRedirectUrl,
} from "../../utils";
import { AuthInput, PasswordInput, GoogleSignInButton } from "../ui";
import { ArrowRight, AlertCircle, ChevronDown } from "lucide-react";
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
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

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
      setRegisteredEmail(data.email);
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

  if (registeredEmail) {
    return (
      <div className="text-center space-y-4 py-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-blue-50 p-4">
            <Mail className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          We sent a verification link to <span className="font-medium text-foreground">{registeredEmail}</span>.
          Click the link to activate your account.
        </p>
        <p className="text-xs text-muted-foreground">Didn&apos;t receive it? Check your spam folder.</p>
        <Link href="/login" className="block text-sm text-blue-600 underline hover:text-blue-500">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-2 ${className}`}
    >
      {/* Auth options — both buttons matched to 320px centered */}
      <div className="flex flex-col items-center gap-2">
        <GoogleSignInButton
          text="signup_with"
          onSuccess={() => router.push(redirectTo || "/")}
        />

        <button
          type="button"
          onClick={() => setShowEmailForm((v) => !v)}
          style={{ width: "320px" }}
          className="h-10 flex items-center gap-3 px-3 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-sm text-gray-600 shadow-sm"
        >
          <svg viewBox="0 0 48 48" className="h-4 w-4 flex-shrink-0">
              <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"/>
              <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"/>
              <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"/>
              <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"/>
              <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0C43.076,8,45,9.924,45,12.298z"/>
            </svg>
          <span className="flex-1 text-center text-[13px]">Continue with Email</span>
          <ChevronDown className={`h-3.5 w-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${showEmailForm ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Email form — revealed on click */}
      {showEmailForm && (
        <div className="space-y-2">
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
            className="!h-9"
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
            className="!h-9"
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
            className="!h-9"
          />

          {/* Confirm Password Field */}
          <PasswordInput
            {...register("confirmPassword", { onChange: () => { clearErrors("confirmPassword"); setFormError(null); } })}
            label="Confirm Password"
            placeholder="Confirm your password"
            error={errors.confirmPassword?.message}
            required
            disabled={isSubmitting}
            className="!h-9"
          />

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-2.5">
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
            className="w-full h-10 text-sm font-semibold text-white rounded-md transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        </div>
      )}

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 underline font-medium hover:text-blue-500 transition-colors">
          Sign in here
        </Link>
      </p>
    </form>
  );
}
