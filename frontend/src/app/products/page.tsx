"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ProductFilters,
  ProductsLoading,
  PaginatedProducts,
  ActiveFilters,
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // State
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentFilters, setCurrentFilters] = useState<ProductFiltersState>({
    search: "",
    category: [],
    minPrice: 0,
    maxPrice: 100000,
    inStock: false,
    onSale: false,
  });

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await apiClient.getProducts();
        setProducts(productsData);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setError(
          "Unable to load products. Please check your connection and try again."
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    if (!products.length) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products];

    // Apply search filter
    if (currentFilters.search) {
      filtered = filtered.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(currentFilters.search.toLowerCase()) ||
          product.category_name
            .toLowerCase()
            .includes(currentFilters.search.toLowerCase())
      );
    }

    // Apply category filter (support both string and array)
    const categories = Array.isArray(currentFilters.category)
      ? currentFilters.category
      : currentFilters.category
      ? [currentFilters.category]
      : [];

    if (categories.length > 0) {
      filtered = filtered.filter((product) => {
        // If product has no category, treat it as "Uncategorized"
        const productCategory = product.category_name || "Uncategorized";
        return categories.includes(productCategory);
      });
    }

    // Apply price range filter
    filtered = filtered.filter((product) => {
      const price = Number(product.price);
      return (
        price >= currentFilters.minPrice && price <= currentFilters.maxPrice
      );
    });

    // Apply stock filter
    if (currentFilters.inStock) {
      filtered = filtered.filter((product) => product.stock_quantity > 0);
    }

    // Apply on sale filter
    if (currentFilters.onSale) {
      filtered = filtered.filter((product) => product.is_on_sale);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
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

    setFilteredProducts(filtered);
  }, [products, currentFilters, sortBy]);

  // Update URL when state changes
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const params = new URLSearchParams();

    if (currentFilters.search) params.set("search", currentFilters.search);

    // Handle category array
    const categories = Array.isArray(currentFilters.category)
      ? currentFilters.category
      : currentFilters.category
      ? [currentFilters.category]
      : [];

    if (categories.length > 0) {
      params.set("category", categories.join(","));
    }

    if (currentFilters.minPrice > 0)
      params.set("minPrice", String(currentFilters.minPrice));
    if (currentFilters.maxPrice < 100000)
      params.set("maxPrice", String(currentFilters.maxPrice));
    if (currentFilters.inStock) params.set("inStock", "true");
    if (currentFilters.onSale) params.set("onSale", "true");
    if (sortBy !== "name-asc") params.set("sort", sortBy);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (itemsPerPage !== 10) params.set("perPage", String(itemsPerPage));

    const newUrl = params.toString()
      ? `/products?${params.toString()}`
      : "/products";
    router.replace(newUrl, { scroll: false });
  }, [currentFilters, sortBy, currentPage, itemsPerPage, router]);

  const handleFiltersChange = useCallback((filters: ProductFiltersState) => {
    setCurrentFilters(filters);
    setCurrentPage(1);
  }, []);

  const handleRemoveFilter = useCallback(
    (filterKey: keyof ProductFiltersState) => {
      const newFilters = { ...currentFilters };

      switch (filterKey) {
        case "search":
          newFilters.search = "";
          break;
        case "category":
          newFilters.category = [];
          break;
        case "minPrice":
        case "maxPrice":
          newFilters.minPrice = 0;
          newFilters.maxPrice = 100000;
          break;
        case "inStock":
          newFilters.inStock = false;
          break;
        case "onSale":
          newFilters.onSale = false;
          break;
      }

      setCurrentFilters(newFilters);
      setCurrentPage(1);
    },
    [currentFilters]
  );

  const handleClearAllFilters = useCallback(() => {
    setCurrentFilters({
      search: "",
      category: [],
      minPrice: 0,
      maxPrice: 100000,
      inStock: false,
      onSale: false,
    });
    setCurrentPage(1);
  }, []);

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
          <div
            className={`lg:col-span-1 ${
              showFilters ? "block" : "hidden lg:block"
            }`}
          >
            <ProductFilters
              onFiltersChange={handleFiltersChange}
              allProducts={products}
            />
          </div>

          <div className="lg:col-span-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-foreground">
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "Product" : "Products"}
                </h2>
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

                <Select
                  value={String(itemsPerPage)}
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
              </div>
            </div>

            <ActiveFilters
              filters={currentFilters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
              totalProducts={filteredProducts.length}
            />

            {filteredProducts.length > 0 && (
              <div className="mb-4 text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>
                {" - "}
                <span className="font-medium text-foreground">
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredProducts.length
                  )}
                </span>
                {" of "}
                <span className="font-medium text-foreground">
                  {filteredProducts.length}
                </span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </div>
            )}

            <PaginatedProducts
              products={filteredProducts}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
