/**
 * PriceRangeFilter Component
 * Min/Max price input filter
 */

"use client";

import React from "react";
import Input from "@/shared/components/ui/input";
import Label from "@/shared/components/ui/label";
import { cn } from "@/shared/utils";

interface PriceRangeFilterProps {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
  className?: string;
}

export function PriceRangeFilter({
  min,
  max,
  currentMin,
  currentMax,
  onChange,
  className,
}: PriceRangeFilterProps) {
  const handleMinChange = (value: string) => {
    const numValue = value === "" ? min : Number(value);
    if (numValue >= min && numValue <= currentMax) {
      onChange(numValue, currentMax);
    }
  };

  const handleMaxChange = (value: string) => {
    const numValue = value === "" ? max : Number(value);
    if (numValue >= currentMin && numValue <= max) {
      onChange(currentMin, numValue);
    }
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor="min-price" className="text-xs text-muted-foreground w-7 shrink-0">Min</Label>
        <Input
          id="min-price"
          type="number"
          min={min}
          max={currentMax}
          value={currentMin}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleMinChange(e.target.value)
          }
          className="h-7 text-xs"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="max-price" className="text-xs text-muted-foreground w-7 shrink-0">Max</Label>
        <Input
          id="max-price"
          type="number"
          min={currentMin}
          max={max}
          value={currentMax}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleMaxChange(e.target.value)
          }
          className="h-7 text-xs"
        />
      </div>
    </div>
  );
}
