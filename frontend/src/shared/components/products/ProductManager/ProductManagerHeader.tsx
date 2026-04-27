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
        "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-6",
        className
      )}
    >
      <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap">
        {paginatedProducts.length}{" "}
        {paginatedProducts.length === 1 ? "product" : "products"}
      </span>

      <div className="flex items-center gap-2 flex-wrap">
        {showSearch && (
          <SearchBar
            value={filters.search}
            onChange={handleSearchChange}
            className="w-48"
          />
        )}
        {showSort && (
          <SortSelect value={sortBy} onChange={setSortBy} className="w-36" />
        )}
        {showItemsPerPage && (
          <Select
            value={String(pagination.pageSize)}
            onValueChange={handleItemsPerPageChange}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 / page</SelectItem>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
            </SelectContent>
          </Select>
        )}
        {actions}
      </div>
    </div>
  );
}
