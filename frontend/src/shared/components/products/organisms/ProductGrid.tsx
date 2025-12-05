/**
 * ProductGrid Organism Component
 * Responsive grid layout for product cards with loading and empty states
 */

"use client";

import React from "react";
import { Product } from "@/shared/types/api.types";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/shared/components/ui";
import { Package } from "lucide-react";
import { cn } from "@/shared/utils";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyMessage?: string;
  cardVariant?: "grid" | "list" | "compact";
  showActions?: boolean;
  onQuickView?: (product: Product) => void;
  renderActions?: (product: Product) => React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = "No products found",
  cardVariant = "grid",
  showActions = false,
  onQuickView,
  renderActions,
  columns = 3,
  className,
}: ProductGridProps) {
  const columnClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "grid gap-6",
          cardVariant === "list" ? "grid-cols-1" : columnClasses[columns],
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-56 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Products Found
        </h3>
        <p className="text-muted-foreground max-w-md">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-6",
        cardVariant === "list" ? "grid-cols-1" : columnClasses[columns],
        className
      )}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={cardVariant}
          showActions={showActions}
          onQuickView={onQuickView}
          actions={renderActions ? renderActions(product) : undefined}
        />
      ))}
    </div>
  );
}
