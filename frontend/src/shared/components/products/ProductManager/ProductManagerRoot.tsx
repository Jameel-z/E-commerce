/**
 * ProductManager Root Component
 * Main wrapper that provides context to all sub-components
 */

"use client";

import React, { ReactNode } from "react";
import { useProducts } from "@/shared/hooks/useProducts";
import { useProductFilters } from "@/shared/hooks/useProductFilters";
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
  const { products, isLoading, error, refetch } = useProducts();

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
