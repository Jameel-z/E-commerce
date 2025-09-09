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
import { Search, Filter, X } from "lucide-react";

interface ProductFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    category: string;
    minPrice: number;
    maxPrice: number;
    inStock: boolean;
  }) => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  onFiltersChange,
  onClearFilters,
}: ProductFiltersProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await apiClient.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Set empty array if categories fail to load
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    onFiltersChange({
      search,
      category: selectedCategory,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      inStock: inStockOnly,
    });
  }, [search, selectedCategory, priceRange, inStockOnly, onFiltersChange]);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("all");
    setPriceRange([0, 1000]);
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
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-3">
              <Label>Price Range</Label>
              <div className="px-2">
                <Slider
                  value={
                    priceRange.length === 2
                      ? (priceRange as [number, number])
                      : [0, 1000]
                  }
                  onValueChange={setPriceRange}
                  max={1000}
                  min={0}
                  step={10}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={inStockOnly}
                onCheckedChange={(checked) =>
                  setInStockOnly(checked as boolean)
                }
              />
              <Label htmlFor="inStock" className="text-sm font-normal">
                In stock only
              </Label>
            </div>

            {/* Clear Filters Button - Desktop */}
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full hidden lg:flex bg-transparent"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
