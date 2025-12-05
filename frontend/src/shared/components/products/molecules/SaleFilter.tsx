/**
 * SaleFilter Component
 * Checkbox filter for "On Sale Only" products
 */

"use client";

import React from "react";
import Checkbox from "@/shared/components/ui/checkbox";
import Label from "@/shared/components/ui/label";
import { Tag } from "lucide-react";
import { cn } from "@/shared/utils";

interface SaleFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export function SaleFilter({ checked, onChange, className }: SaleFilterProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Checkbox id="on-sale" checked={checked} onCheckedChange={onChange} />
      <Label
        htmlFor="on-sale"
        className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
      >
        <Tag className="h-4 w-4 text-red-500" />
        On Sale Only
      </Label>
    </div>
  );
}
