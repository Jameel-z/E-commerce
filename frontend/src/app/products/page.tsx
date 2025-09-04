"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/features/products/components/product-card";
import { ProductFilters } from "@/features/products/components/product-filters";
import Button from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { apiClient, type Product } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

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

  const handleFiltersChange = (filters: {
    search: string;
    category: string;
    minPrice: number;
    maxPrice: number;
    inStock: boolean;
  }) => {
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
    if (filters.category) {
      filtered = filtered.filter(
        (product) => product.category_name === filters.category
      );
    }

    // Price range filter
    filtered = filtered.filter(
      (product) =>
        product.price >= filters.minPrice && product.price <= filters.maxPrice
    );

    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter((product) => product.stock_quantity > 0);
    }

    setFilteredProducts(filtered);
  };

  const handleClearFilters = () => {
    setFilteredProducts(products);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
            </div>
            <div className="lg:col-span-3">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-96 bg-muted animate-pulse rounded-lg"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-secondary" />
              <h1 className="text-2xl font-bold">Products</h1>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 mt-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-semibold text-red-800 mb-1">
                Failed to Load Products
              </h4>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-800 underline hover:text-red-900"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
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
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded mb-4"></div>
                      <div className="h-8 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <Card className="max-w-md mx-auto">
                  <CardContent className="p-8">
                    <Package className="h-16 w-16 mx-auto text-red-400 mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-red-800">
                      Connection Error
                    </h3>
                    <p className="text-red-600 mb-4">
                      Unable to load products from the server.
                    </p>
                    <Button
                      onClick={() => window.location.reload()}
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No products found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
