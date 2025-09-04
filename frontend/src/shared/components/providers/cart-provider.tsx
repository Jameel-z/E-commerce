"use client";

import type { ReactNode } from "react";
import { CartContext, useCartProvider } from "@/shared/hooks/use-cart";

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const cart = useCartProvider();

  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}
