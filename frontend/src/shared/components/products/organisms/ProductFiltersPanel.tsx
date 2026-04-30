/**
 * ProductFiltersPanel Organism Component
 * Complete filter panel with all filter options
 */

"use client";

import React, { useState, useEffect } from "react";
import { Category } from "@/shared/types/api.types";
import { ProductFiltersState } from "@/shared/types/product.types";
import { Product } from "@/shared/types/api.types";
import {
  SearchBar,
  CategoryFilter,
  PriceRangeFilter,
  SaleFilter,
  StockFilter,
} from "../molecules";
import { Button } from "@/shared/components/ui/button";
import { X, SlidersHorizontal } from "lucide-react";
import { cn, getPriceRange, hasActiveFilters } from "@/shared/utils";
import { apiClient } from "@/lib/api";

interface ProductFiltersPanelProps {
  filters: ProductFiltersState;
  onChange: (filters: ProductFiltersState) => void;
  products: Product[];
  layout?: "sidebar" | "horizontal";
  className?: string;
}

export function ProductFiltersPanel({
  filters,
  onChange,
  products,
  layout = "sidebar",
  className,
}: ProductFiltersPanelProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch category tree
  useEffect(() => {
    apiClient
      .getCategoryTree()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const priceRange = getPriceRange(products);
  const hasFilters = hasActiveFilters(filters);

  const handleSearchChange = (search: string) => {
    onChange({ ...filters, search });
  };

  const handleCategoryChange = (category: string[]) => {
    onChange({ ...filters, category });
  };

  const handlePriceChange = (min: number, max: number) => {
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const handleSaleChange = (onSale: boolean) => {
    onChange({ ...filters, onSale });
  };

  const handleStockChange = (inStock: boolean) => {
    onChange({ ...filters, inStock });
  };

  const handleReset = () => {
    onChange({
      search: "",
      category: [],
      minPrice: 0,
      maxPrice: 100000,
      inStock: false,
      onSale: false,
    });
  };

  const selectedCategories = Array.isArray(filters.category)
    ? filters.category
    : filters.category
    ? [filters.category]
    : [];

  if (layout === "horizontal") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-4 p-4 bg-card rounded-lg border",
          className
        )}
      >
        <SearchBar
          value={filters.search}
          onChange={handleSearchChange}
          className="flex-1 min-w-[200px]"
        />
        <SaleFilter checked={filters.onSale} onChange={handleSaleChange} />
        <StockFilter checked={filters.inStock} onChange={handleStockChange} />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "space-y-3 p-3 bg-card rounded-lg border sticky top-4 w-[160px]",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-wide">Filters</h2>
        </div>
        {hasFilters && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleReset}>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Search */}
      <SearchBar value={filters.search} onChange={handleSearchChange} />

      {/* Categories */}
      {!isLoading && categories.length > 0 && (
        <div className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</h3>
          <div className="max-h-40 overflow-y-auto pr-0.5 scrollbar-thin">
            <CategoryFilter
              tree={categories}
              selected={selectedCategories}
              onChange={handleCategoryChange}
            />
          </div>
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price Range</h3>
        <PriceRangeFilter
          min={priceRange.min}
          max={priceRange.max}
          currentMin={filters.minPrice}
          currentMax={filters.maxPrice}
          onChange={handlePriceChange}
        />
      </div>

      {/* Sale + Stock — merged into one compact row group */}
      <div className="space-y-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick Filters</h3>
        <SaleFilter checked={filters.onSale} onChange={handleSaleChange} />
        <StockFilter checked={filters.inStock} onChange={handleStockChange} />
      </div>

      {/* Reset Button */}
      {hasFilters && (
        <Button variant="outline" size="sm" className="w-full" onClick={handleReset}>
          <X className="h-3.5 w-3.5 mr-1.5" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
