/**
 * StockFilter Component
 * Checkbox filter for "In Stock Only" products
 */

"use client";

import React from "react";
import Checkbox from "@/shared/components/ui/checkbox";
import Label from "@/shared/components/ui/label";
import { Package } from "lucide-react";
import { cn } from "@/shared/utils";

interface StockFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function StockFilter({
  checked,
  onChange,
  className,
}: StockFilterProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Checkbox id="in-stock" checked={checked} onCheckedChange={onChange} />
      <Label
        htmlFor="in-stock"
        className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
      >
        <Package className="h-4 w-4 text-green-500" />
        In Stock Only
      </Label>
    </div>
  );
}
