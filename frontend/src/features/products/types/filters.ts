/**
 * Product filtering and search types
 * Ensures type safety across the products feature
 */

import { Product, Category } from "@/shared/types";

// Core filter state interface that matches current implementation
export interface ProductFiltersState {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
}

// Individual filter change handlers for granular control
export interface ProductFiltersHandlers {
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onMinPriceChange: (price: number) => void;
  onMaxPriceChange: (price: number) => void;
  onInStockChange: (inStock: boolean) => void;
  onClearFilters: () => void;
}

// Complete products page state interface
export interface ProductsPageState {
  filters: ProductFiltersState;
  categories: Category[];
  isLoadingCategories: boolean;
  categoriesError: string | null;
}

// Filter validation helpers
export const createDefaultFilters = (): ProductFiltersState => ({
  search: "",
  category: "all",
  minPrice: 0,
  maxPrice: 1000,
  inStock: false,
});

export const validatePriceRange = (min: number, max: number): boolean => {
  return min >= 0 && max >= min && max <= 10000;
};

export const isValidCategory = (
  category: string,
  categories: Category[]
): boolean => {
  return category === "all" || categories.some((cat) => cat.name === category);
};

// Type utilities for better type inference
export type ProductFilterKeys = keyof ProductFiltersState;
export type PriceRange = Pick<ProductFiltersState, "minPrice" | "maxPrice">;
export type SearchFilters = Pick<ProductFiltersState, "search" | "category">;
