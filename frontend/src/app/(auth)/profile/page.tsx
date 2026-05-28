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
        style={{
          background:
            "linear-gradient(135deg, #071729 0%, #0f2d56 30%, #1a4a8a 65%, #1d4ed8 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-blue-400/5 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-blue-300/10 blur-3xl" />
        </div>

        {/* Centered content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center py-14 px-4">
          <div className="w-full max-w-sm">
            <ProfileForm />
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
