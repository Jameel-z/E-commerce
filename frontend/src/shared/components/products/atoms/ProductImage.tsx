/**
 * ProductImage Component
 * Product image with optional sale ribbon overlay
 */

"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/shared/utils";
import { Star } from "lucide-react";

interface ProductImageProps {
  src: string | null;
  alt: string;
  discount?: number | null;
  showRibbon?: boolean;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

export function ProductImage({
  src,
  alt,
  discount,
  showRibbon = true,
  className,
  priority = false,
  fill = true,
  width,
  height,
}: ProductImageProps) {
  const imageSrc = src || "/placeholder-product.png";
  const hasDiscount = discount && discount > 0;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {fill ? (
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <Image
          src={imageSrc}
          alt={alt}
          width={width || 400}
          height={height || 400}
          className="object-cover w-full h-full"
          priority={priority}
        />
      )}

      {showRibbon && hasDiscount && (
        <div className="absolute top-2 left-2 z-10">
          <div className="relative">
            <div className="flex items-center gap-1 rounded-md bg-gradient-to-r from-red-600 to-red-500 px-2.5 py-1.5 shadow-lg">
              <Star className="h-3.5 w-3.5 fill-white text-white" />
              <span className="text-sm font-bold text-white">-{discount}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
