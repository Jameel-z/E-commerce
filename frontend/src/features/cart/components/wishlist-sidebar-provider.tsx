"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface WishlistSidebarContextType {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const WishlistSidebarContext = createContext<WishlistSidebarContextType | undefined>(undefined);

export function useWishlistSidebar() {
  const context = useContext(WishlistSidebarContext);
  if (!context) throw new Error("useWishlistSidebar must be used within WishlistSidebarProvider");
  return context;
}

export function WishlistSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <WishlistSidebarContext.Provider value={{ isOpen, openSidebar: () => setIsOpen(true), closeSidebar: () => setIsOpen(false) }}>
      {children}
    </WishlistSidebarContext.Provider>
  );
}
