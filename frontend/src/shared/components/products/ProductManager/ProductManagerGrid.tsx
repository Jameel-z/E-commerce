/**
 * ProductManager Grid Component
 * Product grid integrated with context and pagination
 */

"use client";

import React, { ReactNode } from "react";
import { useProductManager } from "./ProductManagerContext";
import { ProductGrid } from "../organisms/ProductGrid";
import { Product } from "@/shared/types/api.types";
import { Button } from "@/shared/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/utils";

interface ProductManagerGridProps {
  cardVariant?: "grid" | "list" | "compact";
  showActions?: boolean;
  renderActions?: (product: Product) => ReactNode;
  onQuickView?: (product: Product) => void;
  columns?: 2 | 3 | 4 | 5;
  showPagination?: boolean;
  className?: string;
}

export function ProductManagerGrid({
  cardVariant = "grid",
  showActions = false,
  renderActions,
  onQuickView,
  columns = 3,
  showPagination = true,
  className,
}: ProductManagerGridProps) {
  const {
    paginatedProducts,
    isLoading,
    pagination,
    setPage,
    totalPages,
    sortedProducts,
  } = useProductManager();

  const handlePageChange = (page: number) => {
    setPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startItem = (pagination.page - 1) * pagination.pageSize + 1;
  const endItem = Math.min(
    pagination.page * pagination.pageSize,
    sortedProducts.length
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Product Count Summary */}
      {sortedProducts.length > 0 && !isLoading && (
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{startItem}</span>
          {" - "}
          <span className="font-medium text-foreground">{endItem}</span>
          {" of "}
          <span className="font-medium text-foreground">
            {sortedProducts.length}
          </span>{" "}
          {sortedProducts.length === 1 ? "product" : "products"}
        </div>
      )}

      {/* Product Grid */}
      <ProductGrid
        products={paginatedProducts}
        isLoading={isLoading}
        cardVariant={cardVariant}
        showActions={showActions}
        renderActions={renderActions}
        onQuickView={onQuickView}
        columns={columns}
        emptyMessage="No products match your filters. Try adjusting your search criteria."
      />

      {/* Pagination */}
      {showPagination && totalPages > 1 && !isLoading && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Show first, last, current, and adjacent pages
              const showPage =
                page === 1 ||
                page === totalPages ||
                Math.abs(page - pagination.page) <= 1;

              if (!showPage) {
                // Show ellipsis
                if (
                  page === pagination.page - 2 ||
                  page === pagination.page + 2
                ) {
                  return (
                    <span key={page} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <Button
                  key={page}
                  variant={pagination.page === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="min-w-[2.5rem]"
                >
                  {page}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
