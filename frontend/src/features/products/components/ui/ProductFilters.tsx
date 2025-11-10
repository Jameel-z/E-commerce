"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/shared/components/ui/button";
import Input from "@/shared/components/ui/input";
import Label from "@/shared/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Slider } from "@/shared/components/ui/slider";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { apiClient, type Product } from "@/lib/api";
import { type Category } from "@/shared/types";
import { type ProductFiltersState } from "@/features/products/types";
import {
  Search,
  Filter,
  X,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useDebounce } from "@/shared/hooks/use-debounce";

interface ProductFiltersProps {
  onFiltersChange: (filters: ProductFiltersState) => void;
  allProducts?: Product[];
}

export function ProductFilters({
  onFiltersChange,
  allProducts = [],
}: ProductFiltersProps) {
  // Local state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const isSearching = searchInput !== debouncedSearch;

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategoryList, setShowCategoryList] = useState(true);

  // Calculate category counts (including Uncategorized)
  const categoryCounts = useMemo(() => {
    if (!allProducts.length) return {};

    const counts: Record<string, number> = {
      all: allProducts.length,
    };

    allProducts.forEach((product) => {
      const category = product.category_name || "Uncategorized";
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }, [allProducts]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiClient.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("❌ Failed to fetch categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Trigger filter changes when local state changes
  useEffect(() => {
    const filters: ProductFiltersState = {
      search: debouncedSearch,
      category: selectedCategories,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      inStock: inStockOnly,
    };
    onFiltersChange(filters);
  }, [
    debouncedSearch,
    selectedCategories,
    priceRange,
    inStockOnly,
    onFiltersChange,
  ]);

  // Handle category toggle
  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((cat) => cat !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };

  // Select all categories (including Uncategorized)
  const handleSelectAllCategories = () => {
    const allCategoryNames = [
      ...categories.map((cat) => cat.name),
      ...(categoryCounts["Uncategorized"] && categoryCounts["Uncategorized"] > 0
        ? ["Uncategorized"]
        : []),
    ];

    if (
      selectedCategories.length === allCategoryNames.length &&
      allCategoryNames.length > 0
    ) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(allCategoryNames);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setSearchInput("");
    setSelectedCategories([]);
    setPriceRange([0, 100000]);
    setInStockOnly(false);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        {isSearching ? (
          <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 animate-spin" />
        ) : (
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        )}
        <Input
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
        <Button
          variant="ghost"
          onClick={resetFilters}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>

      {/* Filters */}
      <div className={`space-y-4 ${showFilters ? "block" : "hidden lg:block"}`}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category Filter with Checkboxes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Categories</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCategoryList(!showCategoryList)}
                  className="h-8 w-8 p-0"
                >
                  {showCategoryList ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {showCategoryList && (
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3 bg-background">
                  {/* Select All Option */}
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <Checkbox
                      id="category-all"
                      checked={
                        selectedCategories.length ===
                          categories.length +
                            (categoryCounts["Uncategorized"] > 0 ? 1 : 0) &&
                        categories.length > 0
                      }
                      onCheckedChange={handleSelectAllCategories}
                    />
                    <Label
                      htmlFor="category-all"
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      All Categories ({categoryCounts.all || 0})
                    </Label>
                  </div>

                  {/* Individual Categories */}
                  {categories.length > 0 || categoryCounts["Uncategorized"] ? (
                    <>
                      {categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center space-x-2 py-1"
                        >
                          <Checkbox
                            id={`category-${category.id}`}
                            checked={selectedCategories.includes(category.name)}
                            onCheckedChange={() =>
                              handleCategoryToggle(category.name)
                            }
                          />
                          <Label
                            htmlFor={`category-${category.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {category.name} (
                            {categoryCounts[category.name] || 0})
                          </Label>
                        </div>
                      ))}

                      {/* Uncategorized products */}
                      {categoryCounts["Uncategorized"] &&
                        categoryCounts["Uncategorized"] > 0 && (
                          <div className="flex items-center space-x-2 py-1">
                            <Checkbox
                              id="category-uncategorized"
                              checked={selectedCategories.includes(
                                "Uncategorized"
                              )}
                              onCheckedChange={() =>
                                handleCategoryToggle("Uncategorized")
                              }
                            />
                            <Label
                              htmlFor="category-uncategorized"
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              Uncategorized ({categoryCounts["Uncategorized"]})
                            </Label>
                          </div>
                        )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No categories available
                    </p>
                  )}
                </div>
              )}

              {/* Selected Categories Summary */}
              {selectedCategories.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedCategories.length} categor
                  {selectedCategories.length === 1 ? "y" : "ies"} selected
                </p>
              )}
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Price Range</Label>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="minPrice"
                    className="text-xs text-muted-foreground"
                  >
                    Min Price
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="0"
                      value={priceRange[0] === 0 ? "" : priceRange[0]}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setPriceRange([0, priceRange[1]]);
                        } else {
                          const numValue = Number(value);
                          if (
                            !isNaN(numValue) &&
                            numValue >= 0 &&
                            numValue <= 100000
                          ) {
                            setPriceRange([
                              numValue,
                              Math.max(numValue, priceRange[1]),
                            ]);
                          }
                        }
                      }}
                      className="pl-7"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label
                    htmlFor="maxPrice"
                    className="text-xs text-muted-foreground"
                  >
                    Max Price
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                      $
                    </span>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="No limit"
                      value={priceRange[1] === 100000 ? "" : priceRange[1]}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setPriceRange([priceRange[0], 100000]);
                        } else {
                          const numValue = Number(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setPriceRange([
                              priceRange[0],
                              Math.max(priceRange[0], numValue),
                            ]);
                          }
                        }
                      }}
                      className="pl-7"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div className="px-2 pt-2">
                <Slider
                  max={100000}
                  min={0}
                  step={10}
                  value={priceRange}
                  onValueChange={(value) =>
                    setPriceRange(value as [number, number])
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>
                    {priceRange[1] === 100000
                      ? "No limit"
                      : `$${priceRange[1].toLocaleString()}`}
                  </span>
                </div>
              </div>
            </div>

            {/* In Stock Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={inStockOnly}
                onCheckedChange={(checked) => setInStockOnly(checked === true)}
              />
              <Label
                htmlFor="inStock"
                className="text-sm font-normal cursor-pointer"
              >
                In stock only
              </Label>
            </div>

            {/* Clear Filters Button */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
