"use client";

import { WishlistSidebar } from "@/features/cart/components/wishlist-sidebar";
import { useWishlistSidebar } from "@/features/cart/components/wishlist-sidebar-provider";

export function WishlistSidebarRenderer() {
  const { isOpen, closeSidebar } = useWishlistSidebar();
  return <WishlistSidebar isOpen={isOpen} onClose={closeSidebar} />;
}
