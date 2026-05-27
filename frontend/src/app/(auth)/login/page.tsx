import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/forms";
import { ShoppingBag, Package, Truck, Heart, ShieldCheck, Star, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign In | 961shop",
  description: "Sign in to your account to continue shopping",
};

const features = [
  { icon: Package, label: "Thousands of products" },
  { icon: Truck, label: "Real-time order tracking" },
  { icon: Heart, label: "Personal wishlist" },
  { icon: ShieldCheck, label: "Secure checkout" },
];

const starColors = ["bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-pink-500"];

export default function LoginPage() {
  const year = new Date().getFullYear();

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #071729 0%, #0f2d56 30%, #1a4a8a 65%, #1d4ed8 100%)",
      }}
    >
      {/* Global decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[32rem] h-[32rem] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-80 h-80 rounded-full bg-blue-400/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-blue-300/10 blur-3xl" />
      </div>

      {/* ── Left: Brand panel (desktop only) ─────────── */}
      <div className="hidden lg:flex w-[52%] relative flex-col justify-between p-12 xl:p-16 z-10">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-3 group w-fit">
          <div className="bg-white/15 backdrop-blur-sm p-2.5 rounded-2xl group-hover:bg-white/20 transition-colors">
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <span className="text-3xl font-bold tracking-tight">
            <span className="text-blue-300">9</span>
            <span className="text-rose-300">6</span>
            <span className="text-amber-300">1</span>
            <span className="text-white">shop</span>
          </span>
        </Link>

        {/* Headline + features */}
        <div className="max-w-sm">
          <h2 className="text-4xl xl:text-[2.6rem] font-bold text-white leading-tight mb-1">
            Welcome back!
          </h2>
          <p className="text-2xl xl:text-3xl font-bold text-blue-300 leading-tight mb-4">
            Good to see you.
          </p>
          <p className="text-blue-200/70 text-sm leading-relaxed mb-10">
            Sign in to pick up where you left off — your cart and wishlist are waiting.
          </p>

          <ul className="space-y-4">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-blue-200" />
                </span>
                <span className="text-blue-100 text-sm font-medium">{label}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="flex items-center gap-3 mt-8 pt-7 border-t border-white/10">
            <div className="flex -space-x-2 flex-shrink-0">
              {starColors.map((color, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full ${color} flex items-center justify-center ring-2 ring-white/20`}
                >
                  <Star className="h-3.5 w-3.5 text-white fill-white" />
                </div>
              ))}
            </div>
            <span className="text-blue-200/70 text-sm">
              <span className="text-white font-semibold">2,000+</span> happy customers
            </span>
          </div>
        </div>

        {/* Back to store */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-blue-300/50 hover:text-blue-300 text-xs transition-colors group w-fit"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to store
        </Link>
      </div>

      {/* ── Right: Form panel ─────────────────────────── */}
      <div className="flex-1 grid place-items-center min-h-screen px-6 sm:px-10 py-12 z-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="bg-white/15 backdrop-blur-sm p-2 rounded-xl">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-blue-300">9</span>
              <span className="text-rose-300">6</span>
              <span className="text-amber-300">1</span>
              <span className="text-white">shop</span>
            </span>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-8">
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

          {/* Mobile footer */}
          <p className="lg:hidden text-center text-blue-400/40 text-xs mt-6">
            © {year} 961shop · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}
