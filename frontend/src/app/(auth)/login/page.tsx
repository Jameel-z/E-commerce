import { Metadata } from "next";
import { Suspense } from "react";
import { UnifiedLayout } from "@/shared/components/layout/UnifiedLayout";
import { AuthCard } from "@/features/auth/components/ui";
import { LoginForm } from "@/features/auth/components/forms";
import { LogIn } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | E-commerce",
  description: "Sign in to your account to continue shopping",
};

export default function LoginPage() {
  return (
    <UnifiedLayout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <AuthCard
            icon={<LogIn />}
            title="Welcome Back"
            subtitle="Sign in to your account to continue shopping"
          >
            <Suspense>
              <LoginForm />
            </Suspense>
          </AuthCard>
        </div>
      </div>
    </UnifiedLayout>
  );
}
