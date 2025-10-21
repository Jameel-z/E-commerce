"use client";

import { CartSidebar, useCartSidebar } from "@/features/cart/components";

export function CartSidebarRenderer() {
  const { isOpen, closeSidebar } = useCartSidebar();

  return <CartSidebar isOpen={isOpen} onClose={closeSidebar} />;
}
