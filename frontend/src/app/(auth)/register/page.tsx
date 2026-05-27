import { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/features/auth/components/forms";
import { ShoppingBag, Truck, BadgePercent, HeadphonesIcon, Lock } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account | 961shop",
  description: "Create your account to start shopping with us",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-row-reverse">

      {/* ── Right Brand Panel ────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[42%] relative overflow-hidden flex-col"
        style={{
          background:
            "linear-gradient(150deg, #0b1f3a 0%, #1a4a8a 55%, #3d7bd4 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-white/[0.04]" />
        <div className="absolute top-[40%] -left-20 w-80 h-80 rounded-full bg-white/[0.04]" />
        <div className="absolute -bottom-24 right-8 w-96 h-96 rounded-full bg-white/[0.04]" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 w-fit">
            <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span style={{ color: "#93c5fd" }}>9</span>
              <span style={{ color: "#fca5a5" }}>6</span>
              <span style={{ color: "#fde68a" }}>1</span>
              <span className="text-white">shop</span>
            </span>
          </Link>

          {/* Main content */}
          <div className="my-auto py-10">
            <div className="mb-10">
              <h2 className="text-[2.6rem] font-bold text-white leading-tight mb-4">
                Join our<br />
                <span className="text-blue-300">community today.</span>
              </h2>
              <p className="text-blue-200 text-base leading-relaxed">
                Create your free account and unlock<br />
                exclusive deals, fast shipping & more.
              </p>
            </div>

            {/* Perks */}
            <div className="space-y-4">
              {[
                { Icon: BadgePercent,     label: "Exclusive member discounts" },
                { Icon: Truck,            label: "Free & fast delivery" },
                { Icon: HeadphonesIcon,   label: "Priority customer support" },
                { Icon: Lock,             label: "100% secure & private" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="bg-white/15 p-2 rounded-lg flex-shrink-0">
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-blue-100 text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* Trust badge */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="inline-flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3">
                <Lock className="h-4 w-4 text-green-300 flex-shrink-0" />
                <span className="text-blue-100 text-xs leading-snug">
                  Your data is <span className="text-white font-semibold">encrypted</span> and never shared with third parties.
                </span>
              </div>
            </div>
          </div>

          <p className="text-blue-400/50 text-xs">
            © {new Date().getFullYear()} 961shop. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Left Form Panel ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-white dark:bg-slate-800 border-b">
          <Link href="/" className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <span className="text-xl font-bold tracking-tight">
              <span style={{ color: "#4285F4" }}>9</span>
              <span style={{ color: "#EA4335" }}>6</span>
              <span style={{ color: "#FBBC05" }}>1</span>
              <span className="text-foreground">shop</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Store
          </Link>
        </div>

        {/* Centered content */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">

            {/* Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 px-8 py-9 sm:px-10">
              {/* Header */}
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
                  Create your account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Join 961shop and start exploring
                </p>
              </div>

              <Suspense>
                <RegisterForm />
              </Suspense>
            </div>

            {/* Back link */}
            <p className="hidden lg:block mt-6 text-center text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                ← Back to store
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
