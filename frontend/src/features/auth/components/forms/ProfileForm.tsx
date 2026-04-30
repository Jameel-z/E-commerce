"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/shared/hooks/use-auth";
import { useToast } from "@/shared/hooks/use-toast";
import {
  profileSchema,
  type ProfileFormData,
  handleAuthError,
  handleAuthSuccess,
  getLoadingText,
} from "../../utils";
import { AuthInput, PasswordInput, AuthButton } from "../ui";
import { Save, User, KeyRound, ChevronUp } from "lucide-react";
import { Separator } from "@/shared/components/ui/separator";

interface ProfileFormProps {
  onSuccess?: () => void;
  className?: string;
}

export function ProfileForm({ onSuccess, className = "" }: ProfileFormProps) {
  const { user, updateProfile, updatePassword } = useAuth();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    clearErrors,
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: "onBlur",
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
    }
  }, [user, reset]);

  const newPassword = watch("newPassword");

  // Auto-detect if user wants to change password
  useEffect(() => {
    setIsChangingPassword(!!newPassword);
  }, [newPassword]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    clearErrors();

    try {
      // Update profile info (name only - backend doesn't support email updates)
      if (data.name !== user?.name) {
        await updateProfile({
          name: data.name,
        });
      }

      // Update password if provided (simplified - no current password required)
      if (data.newPassword) {
        await updatePassword(data.newPassword);
      }

      handleAuthSuccess("profile", toast);

      // Reset password fields after successful update
      reset({
        name: data.name,
        email: data.email,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorType = handleAuthError(error, toast);

      // Set specific field errors
      if (errorType === "email") {
        setError("email", { message: "Email already exists" });
      } else if (errorType === "password") {
        setError("newPassword", { message: "Password requirements not met" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-6 ${className}`}
    >
      {/* Profile Information Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Profile Information</span>
        </div>

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

        {/* Email Field - Display Only */}
        <AuthInput
          {...register("email")}
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          disabled={true} // Backend doesn't support email updates
        />
      </div>

      <Separator />

      {/* Password Change Toggle */}
      <button
        type="button"
        onClick={() => setShowPasswordSection((v) => !v)}
        className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          <span>Change Password</span>
        </div>
        <ChevronUp className={`h-4 w-4 transition-transform ${showPasswordSection ? "" : "rotate-180"}`} />
      </button>

      {/* Password Change Section */}
      {showPasswordSection && (
        <div className="space-y-4">
          <PasswordInput
            {...register("newPassword", {
              onChange: () => clearErrors("newPassword"),
            })}
            label="New Password"
            placeholder="Enter your new password"
            error={errors.newPassword?.message}
            disabled={isSubmitting}
            showStrength={isChangingPassword}
            value={newPassword}
          />
          <PasswordInput
            {...register("confirmNewPassword", {
              onChange: () => clearErrors("confirmNewPassword"),
            })}
            label="Confirm New Password"
            placeholder="Confirm your new password"
            error={errors.confirmNewPassword?.message}
            disabled={isSubmitting}
          />
        </div>
      )}

      {/* Submit Button */}
      <AuthButton
        type="submit"
        loading={isSubmitting}
        loadingText={getLoadingText("profile")}
        fullWidth
        disabled={!isDirty}
        className="mt-8"
      >
        <div className="flex items-center">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </div>
      </AuthButton>

      {!isDirty && (
        <p className="text-sm text-muted-foreground text-center">
          Make changes to update your profile
        </p>
      )}
    </form>
  );
}
