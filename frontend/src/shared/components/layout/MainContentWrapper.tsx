"use client";

import { useCartSidebar } from "@/features/cart/components";
import { useEffect } from "react";

interface MainContentWrapperProps {
  children: React.ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const { isOpen } = useCartSidebar();

  useEffect(() => {
    const handleResize = () => {
      if (isOpen && window.innerWidth >= 1024) {
        // Desktop: Push content left by sidebar width (matches w-64 = 256px)
        document.body.style.marginRight = "256px";
        document.body.style.transition = "margin-right 0.3s ease-in-out";
      } else {
        // Mobile or closed: Remove margin
        document.body.style.marginRight = "0px";
      }
    };

    // Apply styles when sidebar opens/closes
    handleResize();

    // Handle window resize to maintain responsive behavior
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.marginRight = "0px";
    };
  }, [isOpen]);

  return <div className="min-h-screen">{children}</div>;
}