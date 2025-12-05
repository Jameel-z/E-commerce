/**
 * ProductManager Header Component
 * Search, sort, and action buttons
 */

"use client";

import React, { ReactNode } from "react";
import { useProductManager } from "./ProductManagerContext";
import { SearchBar, SortSelect } from "../molecules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { cn } from "@/shared/utils";

interface ProductManagerHeaderProps {
  actions?: ReactNode;
  showSearch?: boolean;
  showSort?: boolean;
  showItemsPerPage?: boolean;
  className?: string;
}

export function ProductManagerHeader({
  actions,
  showSearch = true,
  showSort = true,
  showItemsPerPage = true,
  className,
}: ProductManagerHeaderProps) {
  const {
    filters,
    setFilters,
    sortBy,
    setSortBy,
    pagination,
    setPageSize,
    paginatedProducts,
  } = useProductManager();

  const handleSearchChange = (search: string) => {
    setFilters({ ...filters, search });
  };

  const handleItemsPerPageChange = (value: string) => {
    setPageSize(Number(value));
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
        className
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        {showSearch && (
          <SearchBar
            value={filters.search}
            onChange={handleSearchChange}
            className="flex-1 max-w-md"
          />
        )}
        <h2 className="text-xl font-bold text-foreground whitespace-nowrap">
          {paginatedProducts.length}{" "}
          {paginatedProducts.length === 1 ? "Product" : "Products"}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {showSort && (
          <SortSelect value={sortBy} onChange={setSortBy} className="w-48" />
        )}

        {showItemsPerPage && (
          <Select
            value={String(pagination.pageSize)}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 per page</SelectItem>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        )}

        {actions}
      </div>
    </div>
  );
}
