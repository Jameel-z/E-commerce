/**
 * Consolidated Product Type Definitions
 * Single source of truth for all product-related types
 */

import { Category } from "./api.types";

/**
 * Sort options for product lists
 */
export type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";

/**
 * Product filter state interface
 */
export interface ProductFiltersState {
  search: string;
  category: string | string[];
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  onSale: boolean;
}

/**
 * Pagination state interface
 */
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

/**
 * Product form data for create/update operations
 */
export interface ProductFormData {
  name: string;
  description: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: string;
  category_id: string;
  primary_image: File | null;
  secondary_images: File[];
}

/**
 * Default filter values
 */
export const DEFAULT_FILTERS: ProductFiltersState = {
  search: "",
  category: [],
  minPrice: 0,
  maxPrice: 100000,
  inStock: false,
  onSale: false,
};

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION: PaginationState = {
  page: 1,
  pageSize: 10,
  total: 0,
};
