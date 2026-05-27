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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-5 sm:py-10 px-3 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <ProfileForm />
        </div>
      </div>
    </UnifiedLayout>
  );
}
