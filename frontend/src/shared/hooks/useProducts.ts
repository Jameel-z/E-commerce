/**
 * useProducts Hook
 * Centralized product data fetching and state management
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient, type Product } from "@/lib/api";

interface UseProductsReturn {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * @param search - Active search term, if any. When set, this is sent to the
 * backend so results come back ranked by keyword + semantic relevance
 * (see backend/crud/product_crud.py). Refetches whenever it changes.
 */
export function useProducts(search: string = ""): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getProducts(
        search ? { search, per_page: 1000 } : { per_page: 1000 }
      );
      setProducts(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(
        "Unable to load products. Please check your connection and try again."
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refetch: fetchProducts,
  };
}
