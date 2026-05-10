import { Metadata } from "next";
import { Suspense } from "react";
import { UnifiedLayout } from "@/shared/components/layout/UnifiedLayout";
import { AuthCard } from "@/features/auth/components/ui";
import { RegisterForm } from "@/features/auth/components/forms";
import { UserPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "Create Account | E-commerce",
  description: "Create your account to start shopping with us",
};

export default function RegisterPage() {
  return (
    <UnifiedLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <AuthCard
            icon={<UserPlus />}
            title="Create Account"
            subtitle="Join us today and start your shopping journey"
          >
            <Suspense>
              <RegisterForm />
            </Suspense>
          </AuthCard>
        </div>
      </div>
    </UnifiedLayout>
  );
}
