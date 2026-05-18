/**
 * Product Utility Functions
 * Core business logic for product calculations, filtering, and sorting
 */

import { Product, Category } from "../types/api.types";
import { ProductFiltersState, SortOption } from "../types/product.types";

/**
 * Calculate discount percentage between regular and sale price
 */
export function calculateDiscount(
  regularPrice: number,
  salePrice: number
): number {
  if (!regularPrice || !salePrice || salePrice >= regularPrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}

/**
 * Format price for display with currency symbol
 */
export function formatPrice(price: number | string | null): string {
  if (price === null || price === undefined) return "$0.00";
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numPrice);
}

/**
 * Check if product is currently on sale
 */
export function isOnSale(product: Product): boolean {
  return product.is_on_sale || false;
}

/**
 * Get the display price (sale price if on sale, otherwise regular price)
 */
export function getDisplayPrice(product: Product): number {
  if (isOnSale(product) && product.sale_price !== null) {
    return product.sale_price;
  }
  return product.price;
}

/**
 * Get discount percentage for display
 */
export function getDiscountPercentage(product: Product): number {
  return product.discount_percentage || 0;
}

/**
 * Filter products based on filter criteria
 */
export function filterProducts(
  products: Product[],
  filters: ProductFiltersState,
  categoryTree?: Category[]
): Product[] {
  let filtered = [...products];

  // Search filter — split into words, normalize hyphens, AND all words
  if (filters.search) {
    const words = filters.search.toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean);
    filtered = filtered.filter((product) => {
      const name = product.name.toLowerCase().replace(/-/g, " ");
      const desc = (product.description ?? "").toLowerCase().replace(/-/g, " ");
      const cat  = (product.category_name ?? "").toLowerCase().replace(/-/g, " ");
      return words.every((word) => name.includes(word) || desc.includes(word) || cat.includes(word));
    });
  }

  // Category filter
  const categories = Array.isArray(filters.category)
    ? filters.category
    : filters.category
    ? [filters.category]
    : [];

  if (categories.length > 0) {
    const matchingNames = new Set<string>(categories);
    if (categoryTree) {
      for (const selectedName of categories) {
        const parent = categoryTree.find((c) => c.name === selectedName);
        if (parent?.children) {
          parent.children.forEach((child) => matchingNames.add(child.name));
        }
      }
    }
    filtered = filtered.filter((product) =>
      matchingNames.has(product.category_name || "Uncategorized")
    );
  }

  // Price range filter
  filtered = filtered.filter((product) => {
    const price = Number(product.price);
    return price >= filters.minPrice && price <= filters.maxPrice;
  });

  // Stock filter
  if (filters.inStock) {
    filtered = filtered.filter((product) => product.stock_quantity > 0);
  }

  // On sale filter
  if (filters.onSale) {
    filtered = filtered.filter((product) => isOnSale(product));
  }

  return filtered;
}

/**
 * Sort products based on sort option
 */
export function sortProducts(
  products: Product[],
  sortBy: SortOption
): Product[] {
  const sorted = [...products];

  sorted.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime();
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return Number(a.price) - Number(b.price);
      case "price-desc":
        return Number(b.price) - Number(a.price);
      default:
        return 0;
    }
  });

  return sorted;
}

/**
 * Paginate products array
 */
export function paginateProducts(
  products: Product[],
  page: number,
  pageSize: number
): Product[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return products.slice(startIndex, endIndex);
}

/**
 * Calculate total pages for pagination
 */
export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize);
}

/**
 * Validate price range
 */
export function validatePriceRange(min: number, max: number): boolean {
  return min >= 0 && max >= min && max <= 10000000;
}

/**
 * Get price range from products array
 */
export function getPriceRange(products: Product[]): {
  min: number;
  max: number;
} {
  if (products.length === 0) {
    return { min: 0, max: 1000 };
  }

  const prices = products.map((p) => Number(p.price));
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(filters: ProductFiltersState): boolean {
  return (
    filters.search !== "" ||
    (Array.isArray(filters.category) && filters.category.length > 0) ||
    (!Array.isArray(filters.category) && filters.category !== "") ||
    filters.minPrice > 0 ||
    filters.maxPrice < 10000 ||
    filters.inStock ||
    filters.onSale
  );
}
