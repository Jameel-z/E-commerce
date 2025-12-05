/**
 * ProductManager Context
 * Shared state for ProductManager compound component
 */

"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Product } from "@/shared/types/api.types";
import {
  ProductFiltersState,
  SortOption,
  PaginationState,
} from "@/shared/types/product.types";

interface ProductManagerContextValue {
  // Data
  products: Product[];
  isLoading: boolean;
  error: string | null;

  // Filters
  filters: ProductFiltersState;
  setFilters: (filters: ProductFiltersState) => void;
  removeFilter: (key: keyof ProductFiltersState) => void;
  resetFilters: () => void;

  // Sorting
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;

  // Pagination
  pagination: PaginationState;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Computed
  filteredProducts: Product[];
  sortedProducts: Product[];
  paginatedProducts: Product[];
  totalPages: number;

  // Actions
  refetch: () => Promise<void>;
}

const ProductManagerContext = createContext<
  ProductManagerContextValue | undefined
>(undefined);

export function useProductManager() {
  const context = useContext(ProductManagerContext);
  if (!context) {
    throw new Error(
      "useProductManager must be used within ProductManagerProvider"
    );
  }
  return context;
}

interface ProductManagerProviderProps {
  children: ReactNode;
  value: ProductManagerContextValue;
}

export function ProductManagerProvider({
  children,
  value,
}: ProductManagerProviderProps) {
  return (
    <ProductManagerContext.Provider value={value}>
      {children}
    </ProductManagerContext.Provider>
  );
}
