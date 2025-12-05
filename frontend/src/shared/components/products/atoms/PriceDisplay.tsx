/**
 * PriceDisplay Component
 * Displays product pricing with sale price and discount information
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";
import { formatPrice } from "@/shared/utils/product.utils";

interface PriceDisplayProps {
  regularPrice: number | string | null;
  salePrice: number | string | null;
  discountPercentage?: number | null;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
  className?: string;
}

export function PriceDisplay({
  regularPrice,
  salePrice,
  discountPercentage,
  size = "md",
  showDiscount = true,
  className,
}: PriceDisplayProps) {
  // Convert to numbers if strings (handles API returning strings)
  const regularPriceNum = regularPrice
    ? typeof regularPrice === "string"
      ? parseFloat(regularPrice)
      : regularPrice
    : null;
  const salePriceNum = salePrice
    ? typeof salePrice === "string"
      ? parseFloat(salePrice)
      : salePrice
    : null;

  const isOnSale =
    salePriceNum !== null &&
    regularPriceNum !== null &&
    !isNaN(salePriceNum) &&
    !isNaN(regularPriceNum) &&
    salePriceNum > 0 &&
    salePriceNum < regularPriceNum;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
  };

  const regularSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const badgeSizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  if (isOnSale) {
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        <div className="flex items-baseline gap-2">
          <span className={cn("font-bold text-primary", sizeClasses[size])}>
            {formatPrice(salePriceNum!)}
          </span>
          <span
            className={cn(
              "text-muted-foreground line-through",
              regularSizeClasses[size]
            )}
          >
            {formatPrice(regularPriceNum!)}
          </span>
        </div>
        {showDiscount && discountPercentage && discountPercentage > 0 && (
          <span
            className={cn(
              "inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/20 font-semibold text-red-700 dark:text-red-400 w-fit",
              badgeSizeClasses[size]
            )}
          >
            SAVE {discountPercentage}%
          </span>
        )}
      </div>
    );
  }

  // Regular price display
  const displayPrice = regularPriceNum ?? salePriceNum ?? 0;
  return (
    <span
      className={cn("font-bold text-foreground", sizeClasses[size], className)}
    >
      {formatPrice(displayPrice)}
    </span>
  );
}
