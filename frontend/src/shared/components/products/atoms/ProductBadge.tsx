/**
 * ProductBadge Component
 * Reusable badge for product status indicators
 */

"use client";

import React from "react";
import { cn } from "@/shared/utils";
import { LucideIcon } from "lucide-react";

type BadgeVariant = "sale" | "new" | "featured" | "category" | "stock";

interface ProductBadgeProps {
  text: string;
  variant?: BadgeVariant;
  icon?: LucideIcon;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  sale: "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-semibold",
  new: "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-semibold",
  featured:
    "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 font-semibold",
  category:
    "bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground font-medium",
  stock:
    "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium",
};

export function ProductBadge({
  text,
  variant = "category",
  icon: Icon,
  className,
}: ProductBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs",
        variantStyles[variant],
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {text}
    </span>
  );
}
