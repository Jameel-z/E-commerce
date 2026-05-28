import { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/forms";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account | 961shop",
  description: "Create your account to start shopping with us",
};

export default function RegisterPage() {
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
        <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_4px_rgba(0,0,0,0.04)] px-7 py-6">
          {/* Logo — single link, arrow top-left, logo centered */}
          <Link href="/login" className="relative flex justify-center w-full mb-5 group">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 p-1 text-gray-400 group-hover:text-gray-600 transition-colors">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            </span>
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
          <div className="mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-1">
              Create your account
            </h1>
            <p className="text-gray-500 text-sm">
              Start your 961shop journey — it&apos;s completely free.
            </p>
          </div>

          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>

        <p className="text-center text-white/40 text-xs mt-6">
          © {year} 961shop · All rights reserved
        </p>
      </div>
    </div>
  );
}
