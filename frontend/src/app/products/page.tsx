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
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true); // Set to true for loading state
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [showFilters, setShowFilters] = useState(false); // For mobile

  useEffect(() => {
    // Fetch products from the API
    const fetchProducts = async () => {
      try {
        const productsData = await apiClient.getProducts();
        console.log("Fetched products:", productsData); // Debug log
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

  // Sorting logic
  const sortProducts = useCallback((products: Product[], sort: SortOption) => {
    return [...products].sort((a, b) => {
      switch (sort) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        default:
          return 0;
      }
    });
  }, []);

  const handleFiltersChange = useCallback(
    (filters: ProductFiltersState) => {
      let filtered = [...products];

      // Search
      if (filters.search) {
        filtered = filtered.filter(
          (product) =>
            product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            product.category_name
              .toLowerCase()
              .includes(filters.search.toLowerCase())
        );
      }

      // Category
      if (filters.category && filters.category !== "all") {
        filtered = filtered.filter(
          (product) => product.category_name === filters.category
        );
      }

      // Price
      filtered = filtered.filter((product) => {
        const price = Number(product.price);
        return price >= filters.minPrice && price <= filters.maxPrice;
      });

      // Stock
      if (filters.inStock) {
        filtered = filtered.filter((product) => product.stock_quantity > 0);
      }

      // Apply sorting
      filtered = sortProducts(filtered, sortBy);
      setFilteredProducts(filtered);
    },
    [products, sortBy, sortProducts]
  );

  const handleSortChange = (value: string) => {
    const sortValue = value as SortOption; // Cast to SortOption
    setSortBy(sortValue);
    setFilteredProducts(sortProducts(filteredProducts, sortValue));
  };

  const handleClearFilters = () => {
    setFilteredProducts(sortProducts(products, sortBy));
  };

  if (loading) {
    return <ProductsLoading />;
  }

  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: { label: "Back to Home", href: "/" },
        title: "Discover Products",
      }}
    >
      {error && (
        <ErrorBanner error={error} onRetry={() => window.location.reload()} />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Collapsible on Mobile */}
          <div
            className={`lg:col-span-1 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <ProductFilters
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Header with Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-foreground">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "Product" : "Products"}
                </h2>
                {/* Mobile Filter Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name: A-Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z-A</SelectItem>
                    <SelectItem value="price-asc">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-desc">
                      Price: High to Low
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Display */}
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
