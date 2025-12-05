/**
 * ProductManager Compound Component
 * Main export with compound pattern
 */

import { ProductManagerRoot } from "./ProductManagerRoot";
import { ProductManagerHeader } from "./ProductManagerHeader";
import { ProductManagerFilters } from "./ProductManagerFilters";
import { ProductManagerGrid } from "./ProductManagerGrid";

export const ProductManager = Object.assign(ProductManagerRoot, {
  Header: ProductManagerHeader,
  Filters: ProductManagerFilters,
  Grid: ProductManagerGrid,
});

// Also export individual components
export { ProductManagerHeader, ProductManagerFilters, ProductManagerGrid };
export { useProductManager } from "./ProductManagerContext";
