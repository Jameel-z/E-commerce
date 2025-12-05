/**
 * CategoryFilter Component
 * Category selection filter with multi-select support
 */

"use client";

import React from "react";
import { Category } from "@/shared/types/api.types";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/utils";
import { Check } from "lucide-react";

interface CategoryFilterProps {
  categories: Category[];
  selected: string[];
  onChange: (categories: string[]) => void;
  layout?: "vertical" | "horizontal";
  className?: string;
}

export function CategoryFilter({
  categories,
  selected,
  onChange,
  layout = "vertical",
  className,
}: CategoryFilterProps) {
  const toggleCategory = (categoryName: string) => {
    if (selected.includes(categoryName)) {
      onChange(selected.filter((c) => c !== categoryName));
    } else {
      onChange([...selected, categoryName]);
    }
  };

  const isSelected = (categoryName: string) => selected.includes(categoryName);

  return (
    <div
      className={cn(
        "flex gap-2",
        layout === "vertical" ? "flex-col" : "flex-wrap",
        className
      )}
    >
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={isSelected(category.name) ? "default" : "outline"}
          size="sm"
          onClick={() => toggleCategory(category.name)}
          className={cn(
            "justify-start gap-2",
            layout === "horizontal" && "flex-shrink-0"
          )}
        >
          {isSelected(category.name) && <Check className="h-4 w-4" />}
          {category.name}
        </Button>
      ))}
    </div>
  );
}
