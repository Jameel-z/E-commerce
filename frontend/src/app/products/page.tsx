"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ProductFilters,
  ProductsLoading,
  ProductsEmptyState,
  ProductsErrorState,
  ProductsGridLoading,
  ProductsGrid,
} from "@/features/products/components";
import { type ProductFiltersState } from "@/features/products/types";
import { ErrorBanner, UnifiedLayout } from "@/shared/components";
import { apiClient, type Product } from "@/lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await apiClient.getProducts();
        setProducts(productsData);
        setFilteredProducts(productsData);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError(
          "Unable to load products. Please check your connection and try again."
        );
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleFiltersChange = useCallback(
    (filters: ProductFiltersState) => {
      console.log("🔍 Filters applied:", filters);
      let filtered = [...products];

      // Search filter
      if (filters.search) {
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            product.category_name
              .toLowerCase()
              .includes(filters.search.toLowerCase())
        );
      }

      // Category filter
      if (filters.category && filters.category !== "all") {
        console.log("📂 Filtering by category:", filters.category);
        filtered = filtered.filter((product) => {
          console.log(
            `🔍 Product: ${product.name}, Category: ${product.category_name}`
          );
          return product.category_name === filters.category;
        });
      }

      // Price range filter
      filtered = filtered.filter((product) => {
        const productPrice = Number(product.price);
        return (
          productPrice >= filters.minPrice && productPrice <= filters.maxPrice
        );
      });

      // Stock filter
      if (filters.inStock) {
        filtered = filtered.filter((product) => product.stock_quantity > 0);
      }

      console.log(`✅ Filtered results: ${filtered.length} products`);
      setFilteredProducts(filtered);
    },
    [products]
  );

  const handleClearFilters = () => {
    setFilteredProducts(products);
  };

  if (loading) {
    return <ProductsLoading />;
  }

  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: {
          label: "Back to Home",
          href: "/",
        },
        title: "Products",
      }}
    >
      {error && (
        <ErrorBanner error={error} onRetry={() => window.location.reload()} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "Product" : "Products"}
              </h2>
            </div>

            {loading ? (
              <ProductsGridLoading />
            ) : error ? (
              <ProductsErrorState />
            ) : filteredProducts.length === 0 ? (
              <ProductsEmptyState />
            ) : (
              <ProductsGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
