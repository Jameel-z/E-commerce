"use client";

import React, { Suspense, useState } from "react";
import { UnifiedLayout } from "@/shared/components";
import { ProductManager } from "@/shared/components/products/ProductManager";
import { Button } from "@/shared/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { QuickViewModal } from "@/features/products/components/ui/QuickViewModal";
import { Product } from "@/shared/types/api.types";

export default function ProductsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null
  );

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: { label: "Back to Home", href: "/" },
        title: "Discover Products",
      }}
    >
      <div className="w-full px-3 sm:px-4 lg:px-6 py-4">
        <Suspense>
        <ProductManager defaultPageSize={10}>
          <div className="lg:flex lg:gap-3 lg:items-start">
            {/* Filters Sidebar */}
            <div
              className={`lg:flex-shrink-0 ${
                showFilters ? "block" : "hidden lg:block"
              }`}
            >
              <ProductManager.Filters layout="sidebar" />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Mobile Filter Toggle */}
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </Button>
              </div>

              {/* Search, Sort, and Items Per Page */}
              <ProductManager.Header
                showSearch={false}
                showSort={true}
                showItemsPerPage={true}
              />

              {/* Product Grid with Pagination */}
              <ProductManager.Grid
                cardVariant="grid"
                columns={5}
                showPagination={true}
                onQuickView={handleQuickView}
              />
            </div>
          </div>
        </ProductManager>
        </Suspense>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          productId={quickViewProduct.id}
          isOpen={!!quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </UnifiedLayout>
  );
}
