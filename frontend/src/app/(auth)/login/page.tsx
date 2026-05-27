import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/forms";
import { ShoppingBag, ShieldCheck, Package, Heart, Star } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In | 961shop",
  description: "Sign in to your account to continue shopping",
};

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0b1f3a 0%, #1a4a8a 55%, #2d6bcf 100%)" }}
    >
      {/* Background decorations */}
      <div className="absolute -top-48 -left-48 w-[500px] h-[500px] rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full bg-blue-300/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.02] pointer-events-none" />

      {/* Card */}
      <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">

          {/* ── Brand Panel ─────────────────────────────────── */}
          <div
            className="relative overflow-hidden flex-shrink-0 lg:w-[42%] xl:w-[44%]"
            style={{ background: "linear-gradient(150deg, #0b1f3a 0%, #1a3a6e 50%, #1a4a8a 100%)" }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/[0.04]" />
            <div className="absolute bottom-0 -left-16 w-64 h-64 rounded-full bg-white/[0.04]" />

            {/* Mobile: compact header */}
            <div className="lg:hidden relative z-10 flex items-center justify-between px-6 py-5">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">
                  <span style={{ color: "#93c5fd" }}>9</span>
                  <span style={{ color: "#fca5a5" }}>6</span>
                  <span style={{ color: "#fde68a" }}>1</span>
                  <span className="text-white">shop</span>
                </span>
              </Link>
              <Link href="/" className="text-xs text-blue-300 hover:text-white transition-colors">
                ← Store
              </Link>
            </div>

            {/* Desktop: full brand content */}
            <div className="hidden lg:flex relative z-10 flex-col h-full px-10 xl:px-12 py-10 xl:py-12">
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

              <div className="my-auto py-10">
                <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
                  Welcome back!<br />
                  <span className="text-blue-300">Good to see you.</span>
                </h2>
                <p className="text-blue-200 text-sm leading-relaxed mb-8">
                  Sign in to pick up where you left off —<br />
                  your cart and wishlist are waiting.
                </p>

                <div className="space-y-3">
                  {[
                    { Icon: ShoppingBag, label: "Thousands of products" },
                    { Icon: Package,     label: "Real-time order tracking" },
                    { Icon: Heart,       label: "Personal wishlist" },
                    { Icon: ShieldCheck, label: "Secure checkout" },
                  ].map(({ Icon, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="bg-white/15 p-2 rounded-lg flex-shrink-0">
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-blue-100 text-sm font-medium">{label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {["#60a5fa", "#a78bfa", "#34d399", "#f472b6"].map((c) => (
                      <div key={c} className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center" style={{ background: c }}>
                        <Star className="h-3 w-3 text-white fill-white" />
                      </div>
                    ))}
                  </div>
                  <p className="text-blue-200 text-xs leading-snug">
                    <span className="font-semibold text-white">2,000+</span> happy customers
                  </p>
                </div>
              </div>

              <Link href="/" className="text-blue-400/60 text-xs hover:text-blue-300 transition-colors">
                ← Back to store
              </Link>
            </div>
          </div>

          {/* ── Form Panel ──────────────────────────────────── */}
          <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12 xl:px-14">
            <div className="w-full max-w-sm mx-auto lg:max-w-none">
              <div className="mb-7">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground tracking-tight mb-1.5">
                  Sign in to your account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email and password to continue
                </p>
              </div>

              <Suspense>
                <LoginForm />
              </Suspense>
            </div>
          </div>

        </div>

        {/* Bottom tagline */}
        <p className="text-center text-blue-300/50 text-xs mt-5">
          © {new Date().getFullYear()} 961shop · All rights reserved
        </p>
      </div>
    </div>
  );
}
