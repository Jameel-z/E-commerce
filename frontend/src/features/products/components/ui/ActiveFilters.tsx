"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { X } from "lucide-react";
import { type ProductFiltersState } from "@/features/products/types";

interface ActiveFiltersProps {
  filters: ProductFiltersState;
  onRemoveFilter: (filterKey: keyof ProductFiltersState) => void;
  onClearAll: () => void;
  totalProducts: number;
}

export function ActiveFilters({
  filters,
  onRemoveFilter,
  onClearAll,
  totalProducts,
}: ActiveFiltersProps) {
  // Build array of active filters
  const activeFilters: Array<{
    key: keyof ProductFiltersState;
    label: string;
  }> = [];

  if (filters.search) {
    activeFilters.push({
      key: "search",
      label: `Search: "${filters.search}"`,
    });
  }

  // Handle both string and array categories
  const categories = Array.isArray(filters.category)
    ? filters.category
    : filters.category
    ? [filters.category]
    : [];

  if (categories.length > 0) {
    activeFilters.push({
      key: "category",
      label: `Categories: ${categories.join(", ")}`,
    });
  }

  if (filters.minPrice > 0 || filters.maxPrice < 100000) {
    activeFilters.push({
      key: "minPrice",
      label: `Price: $${filters.minPrice} - $${filters.maxPrice}`,
    });
  }

  if (filters.inStock) {
    activeFilters.push({
      key: "inStock",
      label: "In Stock Only",
    });
  }

  // Don't show anything if no filters are active
  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium text-muted-foreground">
        Active Filters:
      </span>

      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="gap-1 pr-1 pl-3 py-1"
        >
          <span>{filter.label}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveFilter(filter.key)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 text-xs"
      >
        Clear All
      </Button>

      <span className="ml-auto text-sm text-muted-foreground">
        {totalProducts} {totalProducts === 1 ? "result" : "results"}
      </span>
    </div>
  );
}
