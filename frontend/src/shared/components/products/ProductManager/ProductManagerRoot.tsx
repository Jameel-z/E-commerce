/**
 * ProductManager Root Component
 * Main wrapper that provides context to all sub-components
 */

"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/shared/hooks/useProducts";
import { useProductFilters } from "@/shared/hooks/useProductFilters";
import { apiClient } from "@/lib/api";
import { Category } from "@/shared/types/api.types";
import { ProductManagerProvider } from "./ProductManagerContext";
import { ProductFiltersState, SortOption } from "@/shared/types/product.types";

type ChildrenFunction = (context: {
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}) => ReactNode;

interface ProductManagerRootProps {
  children: ReactNode | ChildrenFunction;
  defaultFilters?: Partial<ProductFiltersState>;
  defaultSort?: SortOption;
  defaultPageSize?: number;
}

export function ProductManagerRoot({
  children,
  defaultFilters,
  defaultSort,
  defaultPageSize,
}: ProductManagerRootProps) {
  // The URL's `search` param is the single source of truth for the active
  // search term (SearchBar/useProductFilters both write it there). Reading
  // it here means product fetching stays in sync whether the term changed
  // via a full navigation (header search bar) or an in-page search box
  // (admin panel), without the two hooks needing to coordinate directly.
  const searchParams = useSearchParams();
  const activeSearch = searchParams.get("search") || "";

  const { products, isLoading, error, refetch } = useProducts(activeSearch);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);

  useEffect(() => {
    apiClient.getCategoryTree().then(setCategoryTree).catch(() => {});
  }, []);

  const {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    pagination,
    setPage,
    setPageSize,
    filteredProducts,
    sortedProducts,
    paginatedProducts,
    totalPages,
    resetFilters,
    removeFilter,
  } = useProductFilters({
    products,
    categoryTree,
    defaultFilters,
    defaultSort,
    defaultPageSize,
  });

  const contextValue = {
    products,
    isLoading,
    error,
    filters,
    setFilters,
    removeFilter,
    resetFilters,
    sortBy,
    setSortBy,
    pagination,
    setPage,
    setPageSize,
    filteredProducts,
    sortedProducts,
    paginatedProducts,
    totalPages,
    refetch,
  };

  const renderProps = { isLoading, error, refetch };

  return (
    <ProductManagerProvider value={contextValue}>
      {typeof children === "function" ? children(renderProps) : children}
    </ProductManagerProvider>
  );
}
