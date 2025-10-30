"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import Input from "@/shared/components/ui/input";
import Label from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Slider } from "@/shared/components/ui/slider";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { apiClient } from "@/lib/api";
import { type Category } from "@/shared/types";
import { type ProductFiltersState } from "@/features/products/types";
import { Search, Filter, X } from "lucide-react";

interface ProductFiltersProps {
  onFiltersChange: (filters: ProductFiltersState) => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  onFiltersChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiClient.getCategories();
        console.log("📂 Categories fetched:", categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("❌ Failed to fetch categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // Update filters when local state changes
  useEffect(() => {
    const filters: ProductFiltersState = {
      search,
      category: selectedCategory === "all" ? "" : selectedCategory,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      inStock: inStockOnly,
    };
    console.log("🔄 Filters updated:", filters);
    onFiltersChange(filters);
  }, [search, selectedCategory, priceRange, inStockOnly, onFiltersChange]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setPriceRange([0, 2000]);
    setInStockOnly(false);
    onClearFilters();
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
          onClick={handleClearFilters}
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
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  console.log("🔄 Category selection changed:", value);
                  setSelectedCategory(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Enhanced Price Range Filter */}
            <div className="space-y-3">
              <Label>Price Range</Label>

              {/* Input Fields for Min/Max Price */}
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
                            numValue <= 2000
                          ) {
                            setPriceRange([
                              numValue,
                              Math.max(numValue, priceRange[1]),
                            ]);
                          }
                        }
                      }}
                      onFocus={(e) => e.target.select()} // Select all text on focus
                      className="pl-7"
                      min="0"
                      step="any"
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
                      value={priceRange[1] === 2000 ? "" : priceRange[1]}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setPriceRange([priceRange[0], 2000]);
                        } else {
                          const numValue = Number(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            // 🔥 ALLOW ANY VALUE WHILE TYPING - NO VALIDATION YET
                            setPriceRange([priceRange[0], numValue]);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // 🔥 VALIDATE ONLY WHEN USER FINISHES TYPING
                        const value = e.target.value;
                        if (value !== "") {
                          const numValue = Number(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            // Ensure max price is at least equal to min price
                            setPriceRange([
                              priceRange[0],
                              Math.max(priceRange[0], numValue),
                            ]);
                          }
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      className="pl-7"
                      min="0"
                      step="any"
                    />
                  </div>
                </div>
              </div>

              {/* Slider (Optional - Keep or Remove) */}
              <div className="px-2">
                <Slider
                  max={2000}
                  min={0}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="w-full"
                />
              </div>
            </div>

            {/* In Stock Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={inStockOnly}
                onCheckedChange={setInStockOnly}
              />
              <Label htmlFor="inStock" className="text-sm font-normal">
                In stock only
              </Label>
            </div>

            {/* Spacer */}
            <div className="pt-4 border-t border-gray-200">
              {/* Clear Filters Button (Desktop) */}
              <div className="hidden lg:block">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="w-full flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
