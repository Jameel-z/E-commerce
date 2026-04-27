/**
 * useProductFilters Hook
 * Manages product filtering, sorting, and pagination state with URL sync
 */

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Product } from "@/lib/api";
import {
  ProductFiltersState,
  SortOption,
  PaginationState,
  DEFAULT_FILTERS,
  DEFAULT_PAGINATION,
} from "../types/product.types";
import {
  filterProducts,
  sortProducts,
  paginateProducts,
  getTotalPages,
} from "../utils/product.utils";

interface UseProductFiltersProps {
  products: Product[];
  defaultFilters?: Partial<ProductFiltersState>;
  defaultSort?: SortOption;
  defaultPageSize?: number;
}

interface UseProductFiltersReturn {
  // State
  filters: ProductFiltersState;
  sortBy: SortOption;
  pagination: PaginationState;

  // Setters
  setFilters: (filters: ProductFiltersState) => void;
  setSortBy: (sort: SortOption) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Computed
  filteredProducts: Product[];
  sortedProducts: Product[];
  paginatedProducts: Product[];
  totalPages: number;

  // Actions
  resetFilters: () => void;
  removeFilter: (key: keyof ProductFiltersState) => void;
}

export function useProductFilters({
  products,
  defaultFilters = {},
  defaultSort = "name-asc",
  defaultPageSize = 10,
}: UseProductFiltersProps): UseProductFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  // Initialize from URL params or defaults
  const [filters, setFilters] = useState<ProductFiltersState>(() => {
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category")?.split(",") || [];
    const minPrice = Number(searchParams.get("minPrice")) || 0;
    const maxPrice = Number(searchParams.get("maxPrice")) || 100000;
    const inStock = searchParams.get("inStock") === "true";
    const onSale = searchParams.get("onSale") === "true";

    return {
      ...DEFAULT_FILTERS,
      ...defaultFilters,
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      onSale,
    };
  });

  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const sort = searchParams.get("sort");
    return (sort as SortOption) || defaultSort;
  });

  const [pagination, setPagination] = useState<PaginationState>(() => ({
    page: Number(searchParams.get("page")) || 1,
    pageSize: Number(searchParams.get("perPage")) || defaultPageSize,
    total: 0,
  }));

  // Sync from URL when searchParams change externally (e.g. SecondaryNav navigation)
  useEffect(() => {
    const urlSearch = searchParams.get("search") || "";
    const urlCategory = searchParams.get("category")?.split(",").filter(Boolean) || [];

    setFilters((prev) => {
      const sameSearch = prev.search === urlSearch;
      const sameCategory =
        JSON.stringify([...(prev.category as string[])].sort()) ===
        JSON.stringify([...urlCategory].sort());
      if (sameSearch && sameCategory) return prev;
      return { ...prev, search: urlSearch, category: urlCategory };
    });
  }, [searchParams]);

  // Apply filters
  const filteredProducts = useMemo(
    () => filterProducts(products, filters),
    [products, filters]
  );

  // Apply sorting
  const sortedProducts = useMemo(
    () => sortProducts(filteredProducts, sortBy),
    [filteredProducts, sortBy]
  );

  // Apply pagination
  const paginatedProducts = useMemo(
    () =>
      paginateProducts(sortedProducts, pagination.page, pagination.pageSize),
    [sortedProducts, pagination.page, pagination.pageSize]
  );

  // Calculate total pages
  const totalPages = useMemo(
    () => getTotalPages(sortedProducts.length, pagination.pageSize),
    [sortedProducts.length, pagination.pageSize]
  );

  // Update total count
  useEffect(() => {
    setPagination((prev) => ({ ...prev, total: sortedProducts.length }));
  }, [sortedProducts.length]);

  // Sync to URL (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);

    const categories = Array.isArray(filters.category)
      ? filters.category
      : filters.category
      ? [filters.category]
      : [];
    if (categories.length > 0) params.set("category", categories.join(","));

    if (filters.minPrice > 0) params.set("minPrice", String(filters.minPrice));
    if (filters.maxPrice < 100000)
      params.set("maxPrice", String(filters.maxPrice));
    if (filters.inStock) params.set("inStock", "true");
    if (filters.onSale) params.set("onSale", "true");
    if (sortBy !== "name-asc") params.set("sort", sortBy);
    if (pagination.page > 1) params.set("page", String(pagination.page));
    if (pagination.pageSize !== 10)
      params.set("perPage", String(pagination.pageSize));

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(newUrl, { scroll: false });
  }, [filters, sortBy, pagination.page, pagination.pageSize, router]);

  // Reset pagination when filters or sort change
  useEffect(() => {
    if (!isInitialMount.current) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [filters, sortBy]);

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination((prev) => ({ ...prev, pageSize: size, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, ...defaultFilters });
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [defaultFilters]);

  const removeFilter = useCallback(
    (key: keyof ProductFiltersState) => {
      const newFilters = { ...filters };

      switch (key) {
        case "search":
          newFilters.search = "";
          break;
        case "category":
          newFilters.category = [];
          break;
        case "minPrice":
        case "maxPrice":
          newFilters.minPrice = 0;
          newFilters.maxPrice = 100000;
          break;
        case "inStock":
          newFilters.inStock = false;
          break;
        case "onSale":
          newFilters.onSale = false;
          break;
      }

      setFilters(newFilters);
    },
    [filters]
  );

  return {
    filters,
    sortBy,
    pagination,
    setFilters,
    setSortBy,
    setPage,
    setPageSize,
    filteredProducts,
    sortedProducts,
    paginatedProducts,
    totalPages,
    resetFilters,
    removeFilter,
  };
}
