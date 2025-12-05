/**
 * ProductManager Filters Component
 * Filter panel integrated with context
 */

"use client";

import React from "react";
import { useProductManager } from "./ProductManagerContext";
import { ProductFiltersPanel } from "../organisms/ProductFiltersPanel";
import { cn } from "@/shared/utils";

interface ProductManagerFiltersProps {
  layout?: "sidebar" | "horizontal";
  className?: string;
}

export function ProductManagerFilters({
  layout = "sidebar",
  className,
}: ProductManagerFiltersProps) {
  const { filters, setFilters, products } = useProductManager();

  return (
    <ProductFiltersPanel
      filters={filters}
      onChange={setFilters}
      products={products}
      layout={layout}
      className={cn(className)}
    />
  );
}
