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
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
        setFormError(
          "Could not update password. Make sure it meets the requirements."
        );
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
    <div className={`w-full ${className}`}>

      {/* Avatar — floats above card */}
      <div className="flex flex-col items-center mb-0">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-2xl ring-4 ring-white/30 relative z-20"
          style={{ background: "linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)" }}
        >
          {initials}
        </div>
      </div>

      {/* White card */}
      <div className="bg-white rounded-3xl shadow-2xl -mt-12 relative z-10">

        {/* User info header */}
        <div className="text-center pt-14 pb-4 px-7">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight mb-0.5">{displayName}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          {user?.is_admin && (
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3" />
              Administrator
            </span>
          )}
        </div>

        <div className="h-px bg-gray-100" />

        {/* Feedback banner */}
        {(formError || formSuccess) && (
          <div
            className={`flex items-start gap-2.5 mx-5 mt-4 px-3.5 py-3 rounded-xl border text-sm ${
              formError
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}
          >
            {formError ? (
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{formError ?? formSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* ── Profile Information ─────────────────────── */}
          <div className="px-5 pt-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-3.5 w-3.5 text-blue-500" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Profile Information
              </h3>
            </div>

            <div className="space-y-3">
              <AuthInput
                {...register("name", { onChange: clearMessages })}
                label="Full Name"
                type="text"
                placeholder="Your full name"
                error={errors.name?.message}
                required
                disabled={isSubmitting}
                className="!h-10"
              />

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  Email Address
                </label>
                <input
                  value={user?.email || ""}
                  readOnly
                  disabled
                  className="flex h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-400 cursor-not-allowed select-none"
                />
                <p className="text-xs text-gray-400">Email address cannot be changed.</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Password Section ────────────────────────── */}
          <div className="px-5 py-4">
            <button
              type="button"
              onClick={() => setShowPasswordSection((v) => !v)}
              className="flex items-center justify-between w-full group"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5 text-blue-500" />
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
                  Change Password
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                  showPasswordSection ? "rotate-180" : ""
                }`}
              />
            </button>

            {showPasswordSection && (
              <div className="mt-3 space-y-3">
                <PasswordInput
                  {...register("newPassword", { onChange: clearMessages })}
                  label="New Password"
                  placeholder="Enter new password"
                  error={errors.newPassword?.message}
                  disabled={isSubmitting}
                  showStrength={!!newPassword}
                  value={newPassword}
                  className="!h-10"
                />
                <PasswordInput
                  {...register("confirmNewPassword", { onChange: clearMessages })}
                  label="Confirm New Password"
                  placeholder="Confirm new password"
                  error={errors.confirmNewPassword?.message}
                  disabled={isSubmitting}
                  className="!h-10"
                />
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Actions ─────────────────────────────────── */}
          <div className="px-5 py-4">
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges}
              className="w-full h-10 text-sm font-semibold text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: "linear-gradient(135deg, #1a4a8a 0%, #1d4ed8 100%)" }}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-[2.5px] border-white border-t-transparent" />
                  Saving changes…
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

      <p className="text-center text-white/30 text-xs mt-6">
        © {new Date().getFullYear()} 961shop · All rights reserved
      </p>
    </div>
  );
}
