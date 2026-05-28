"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
} from "react";
import type { Product } from "@/shared/types";

interface WishlistContextType {
  items: Product[];
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  clearWishlist: () => void;
  count: number;
}

const STORAGE_KEY = "wishlist";

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

export function useWishlistProvider(): WishlistContextType {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      console.warn("Failed to parse wishlist from localStorage — resetting.");
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = (updated: Product[]) => {
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const isWishlisted = useCallback(
    (productId: number) => items.some((p) => p.id === productId),
    [items]
  );

  const toggleWishlist = useCallback(
    (product: Product) => {
      const exists = items.some((p) => p.id === product.id);
      persist(
        exists ? items.filter((p) => p.id !== product.id) : [...items, product]
      );
    },
    [items]
  );

  const removeFromWishlist = useCallback(
    (productId: number) => {
      persist(items.filter((p) => p.id !== productId));
    },
    [items]
  );

  const clearWishlist = useCallback(() => {
    persist([]);
  }, []);

  return {
    items,
    isWishlisted,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    count: items.length,
  };
}

export { WishlistContext };
