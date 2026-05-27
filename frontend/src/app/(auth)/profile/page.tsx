import { Metadata } from "next";
import { UnifiedLayout } from "@/shared/components/layout/UnifiedLayout";
import { ProfileForm } from "@/features/auth/components/forms";

export const metadata: Metadata = {
  title: "Profile | 961shop",
  description: "Manage your account settings and preferences",
};

export default function ProfilePage() {
  return (
    <UnifiedLayout>
      <div
        className="min-h-screen relative"
        style={{ background: "linear-gradient(135deg, #0b1f3a 0%, #1a4a8a 55%, #2d6bcf 100%)" }}
      >
        {/* Background decorations */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-300/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10 lg:py-14">
          {/* Header */}
          <div className="w-full max-w-xl sm:max-w-2xl xl:max-w-3xl mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">My Profile</h1>
            <p className="text-blue-200 text-sm mt-1">Manage your account settings and preferences</p>
          </div>

          {/* Card */}
          <div className="w-full max-w-xl sm:max-w-2xl xl:max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <ProfileForm />
          </div>

          <p className="text-blue-300/40 text-xs mt-6">
            © {new Date().getFullYear()} 961shop · All rights reserved
          </p>
        </div>
      </div>
    </UnifiedLayout>
  );
}
