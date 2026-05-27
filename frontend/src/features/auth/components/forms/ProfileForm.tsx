"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/shared/hooks/use-auth";
import { profileSchema, type ProfileFormData } from "../../utils";
import { AuthInput, PasswordInput } from "../ui";
import {
  Save,
  KeyRound,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  ShieldCheck,
} from "lucide-react";

interface ProfileFormProps {
  onSuccess?: () => void;
  className?: string;
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    return name.trim().split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
  }
  if (email) return email[0].toUpperCase();
  return "U";
}

export function ProfileForm({ onSuccess, className = "" }: ProfileFormProps) {
  const { user, updateProfile, updatePassword } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

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
      name: "",
      email: "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

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

  const clearMessages = () => {
    setFormError(null);
    setFormSuccess(null);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    clearErrors();
    clearMessages();

    try {
      let didUpdate = false;

      if (data.name !== user?.name) {
        await updateProfile({ name: data.name });
        didUpdate = true;
      }

      if (data.newPassword) {
        await updatePassword(data.newPassword);
        didUpdate = true;
      }

      if (!didUpdate) {
        setFormSuccess("Your profile is already up to date.");
      } else {
        setFormSuccess("Changes saved successfully!");
      }

      reset({
        name: data.name,
        email: data.email,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setShowPasswordSection(false);

      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "";
      const lower = msg.toLowerCase();

      if (lower.includes("fetch") || lower.includes("network")) {
        setFormError("Unable to connect. Please check your internet connection.");
      } else if (lower.includes("password")) {
        setFormError("Could not update password. Make sure it meets the requirements.");
        setError("newPassword", { message: " " });
      } else if (lower.includes("name")) {
        setFormError("Could not update name. Please try again.");
        setError("name", { message: " " });
      } else {
        setFormError(msg || "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = getInitials(user?.name, user?.email);
  const displayName = user?.name || user?.email || "User";
  const hasChanges = isDirty;

  return (
    <div className={className}>
      {/* ── Avatar / User card ────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-4 sm:mb-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0 shadow-md"
            style={{ background: "linear-gradient(135deg, #1a4a8a 0%, #4285F4 100%)" }}
          >
            {initials}
          </div>

          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">{displayName}</h2>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            {user?.is_admin && (
              <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-3 w-3" />
                Administrator
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Form card ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* Feedback banners */}
          {(formError || formSuccess) && (
            <div className={`flex items-start gap-2.5 px-4 sm:px-6 py-3 sm:py-4 border-b ${
              formError
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}>
              {formError
                ? <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                : <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              }
              <span className="text-sm leading-snug">{formError ?? formSuccess}</span>
            </div>
          )}

          {/* ── Section: Profile info ────────────────────── */}
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-2 mb-5">
              <User className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>
            </div>

            <div className="space-y-4">
              <AuthInput
                {...register("name", { onChange: clearMessages })}
                label="Full Name"
                type="text"
                placeholder="Your full name"
                error={errors.name?.message}
                required
                disabled={isSubmitting}
                className="!h-11"
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    value={user?.email || ""}
                    readOnly
                    disabled
                    className="flex h-11 w-full rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed select-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* ── Divider ──────────────────────────────────── */}
          <div className="border-t border-border" />

          {/* ── Section: Password ────────────────────────── */}
          <div className="px-4 sm:px-6 py-4 sm:py-5">
            <button
              type="button"
              onClick={() => setShowPasswordSection((v) => !v)}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  Change Password
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  showPasswordSection ? "rotate-180" : ""
                }`}
              />
            </button>

            {showPasswordSection && (
              <div className="mt-4 space-y-4">
                <PasswordInput
                  {...register("newPassword", { onChange: clearMessages })}
                  label="New Password"
                  placeholder="Enter new password"
                  error={errors.newPassword?.message}
                  disabled={isSubmitting}
                  showStrength={!!newPassword}
                  value={newPassword}
                  className="!h-11"
                />
                <PasswordInput
                  {...register("confirmNewPassword", { onChange: clearMessages })}
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  error={errors.confirmNewPassword?.message}
                  disabled={isSubmitting}
                  className="!h-11"
                />
              </div>
            )}
          </div>

          {/* ── Submit ────────────────────────────────────── */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-1">
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="w-full h-12 text-base font-semibold text-white rounded-md transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #1a4a8a 0%, #4285F4 100%)" }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {hasChanges ? "Save Changes" : "No changes to save"}
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
