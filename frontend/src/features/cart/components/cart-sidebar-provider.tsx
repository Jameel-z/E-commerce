"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// 1. Define the context interface
interface CartSidebarContextType {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

// 2. Create the context
const CartSidebarContext = createContext<CartSidebarContextType | undefined>(
  undefined
);

// 3. Create the hook to use the context
export function useCartSidebar() {
  const context = useContext(CartSidebarContext);
  if (context === undefined) {
    throw new Error("useCartSidebar must be used within a CartSidebarProvider");
  }
  return context;
}

// 4. Create the provider component
interface CartSidebarProviderProps {
  children: ReactNode;
}

export function CartSidebarProvider({ children }: CartSidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <CartSidebarContext.Provider
      value={{
        isOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </CartSidebarContext.Provider>
  );
}
