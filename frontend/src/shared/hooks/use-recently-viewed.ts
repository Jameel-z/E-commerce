"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/shared/types";

const STORAGE_KEY = "recently_viewed";
const MAX_ITEMS = 10;

export function useRecentlyViewed() {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const trackView = useCallback((product: Product) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const current: Product[] = stored ? JSON.parse(stored) : [];
      // Remove if already in list, then prepend
      const filtered = current.filter((p) => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setItems(updated);
    } catch {}
  }, []);

  return { items, trackView };
}
