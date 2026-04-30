import { Metadata } from "next";
import { UnifiedLayout } from "@/shared/components/layout/UnifiedLayout";
import { AuthCard } from "@/features/auth/components/ui";
import { ProfileForm } from "@/features/auth/components/forms";
import { User } from "lucide-react";

export const metadata: Metadata = {
  title: "Profile | E-commerce",
  description: "Manage your account settings and preferences",
};

export default function ProfilePage() {
  return (
    <UnifiedLayout>
      <div className="min-h-screen pb-8 px-4 sm:px-6 lg:px-8">
        <div>
          <AuthCard
            icon={<User />}
            title="Profile Settings"
            subtitle="Manage your account information and preferences"
          >
            <ProfileForm />
          </AuthCard>
        </div>
      </div>
    </UnifiedLayout>
  );
}
