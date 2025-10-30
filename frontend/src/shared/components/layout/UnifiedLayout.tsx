"use client";

import { useAuth } from "@/shared/hooks/use-auth";
import { ReactNode, useEffect } from "react";
import { GlobalHeader, PageHeader, type PageHeaderProps } from "./";
import { useRouter, usePathname } from "next/navigation"; // Add usePathname
import Footer from "./Footer";

interface UnifiedLayoutProps {
  children: ReactNode;
  pageHeaderProps?: PageHeaderProps;
  className?: string;
}

export function UnifiedLayout({
  children,
  pageHeaderProps,
  className = "",
}: UnifiedLayoutProps) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Add this

  useEffect(() => {
    if (user) {
      // Allow access to profile for logged-in users
      if (pathname === "/profile") {
        return; // Don't redirect
      }
      // Redirect away from login/register
      if (pathname === "/login" || pathname === "/register") {
        router.push("/");
      }
    }
  }, [user, router, pathname]);

  return (
    <div className={`min-h-screen bg-background ${className}`}>
      <GlobalHeader />
      {pageHeaderProps && <PageHeader {...pageHeaderProps} />}
      <main>{children}</main>
      <Footer />
    </div>
  );
}
