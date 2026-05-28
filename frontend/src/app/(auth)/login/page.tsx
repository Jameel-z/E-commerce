import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/forms";
import { ShoppingBag, X } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In | 961shop",
  description: "Sign in to your account to continue shopping",
};

export default function LoginPage() {
  const year = new Date().getFullYear();

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12"
      style={{
        background:
          "linear-gradient(135deg, #0a1628 0%, #1e3a8a 35%, #1d4ed8 70%, #2563eb 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-80 h-80 rounded-full bg-blue-400/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-blue-300/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Glass card */}
        <div className="relative w-full bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] px-8 py-8">
          {/* X — top-right corner of card */}
          <Link
            href="/"
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </Link>

          {/* Logo — centered */}
          <Link href="/" className="flex justify-center w-full mb-6 group">
            <span className="inline-flex items-center gap-2">
              <span className="bg-blue-50 group-hover:bg-blue-100 transition-colors p-2 rounded-xl inline-flex">
                <ShoppingBag className="h-5 w-5 text-blue-600" />
              </span>
              <span className="text-xl font-bold tracking-tight">
                <span className="text-blue-500">9</span>
                <span className="text-rose-400">6</span>
                <span className="text-amber-500">1</span>
                <span className="text-gray-800">shop</span>
              </span>
            </span>
          </Link>
          <div className="mb-7">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1.5">
              Sign in to your account
            </h1>
            <p className="text-gray-500 text-sm">
              Enter your email and password to continue
            </p>
          </div>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {year} 961shop · All rights reserved
        </p>
      </div>
    </div>
  );
}
