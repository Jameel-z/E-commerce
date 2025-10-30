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
  handleAuthError,
  handleAuthSuccess,
  getRedirectUrl,
  getLoadingText,
} from "../../utils";
import { AuthInput, PasswordInput, AuthButton } from "../ui";
import { ArrowRight } from "lucide-react";
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

    try {
      await registerUser(data.name, data.email, data.password);

      handleAuthSuccess("register", toast);

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
        setError("email", { message: "Email already exists" });
      } else if (errorType === "password") {
        setError("password", { message: "Password requirements not met" });
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
      {/* Name Field */}
      <AuthInput
        {...register("name", {
          onChange: () => clearErrors("name"),
        })}
        label="Full Name"
        type="text"
        placeholder="Enter your full name"
        error={errors.name?.message}
        required
        disabled={isSubmitting}
      />

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
        autoComplete="off"
      />

      {/* Password Field */}
      <PasswordInput
        {...register("password", {
          onChange: () => clearErrors("password"),
        })}
        label="Password"
        placeholder="Create a secure password"
        error={errors.password?.message}
        required
        disabled={isSubmitting}
        showStrength={true}
        value={password}
        autoComplete="new-password"
      />

      {/* Confirm Password Field */}
      <PasswordInput
        {...register("confirmPassword", {
          onChange: () => clearErrors("confirmPassword"),
        })}
        label="Confirm Password"
        placeholder="Confirm your password"
        error={errors.confirmPassword?.message}
        required
        disabled={isSubmitting}
      />

      {/* Terms Checkbox */}
      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={watch("terms") || false}
          onCheckedChange={(checked) => {
            setValue("terms", checked as boolean);
            if (checked) clearErrors("terms");
          }}
          className="mt-1"
        />
        <label
          htmlFor="terms"
          className="text-sm text-muted-foreground leading-relaxed"
        >
          I agree to the{" "}
          <Link
            href="/terms"
            className="text-primary hover:underline"
            target="_blank"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="text-primary hover:underline"
            target="_blank"
          >
            Privacy Policy
          </Link>
        </label>
      </div>
      {errors.terms && (
        <p className="text-sm text-destructive mt-1">{errors.terms.message}</p>
      )}

      {/* Submit Button */}
      <AuthButton
        type="submit"
        loading={isSubmitting}
        loadingText={getLoadingText("register")}
        fullWidth
        className="mt-6"
      >
        <div className="flex items-center">
          Create Account
          <ArrowRight className="ml-2 h-4 w-4" />
        </div>
      </AuthButton>

      {/* Footer Links */}
      <div className="mt-6 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:underline font-medium"
          >
            Sign in here
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
