"use client";

import type { ReactNode } from "react";
import { WishlistContext, useWishlistProvider } from "@/shared/hooks/use-wishlist";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const wishlist = useWishlistProvider();
  return (
    <WishlistContext.Provider value={wishlist}>
      {children}
    </WishlistContext.Provider>
  );
}
