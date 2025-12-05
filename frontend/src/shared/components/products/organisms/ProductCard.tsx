/**
 * ProductCard Organism Component
 * Enhanced, configurable product card for grid display
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, Button } from "@/shared/components";
import { ProductImage, ProductBadge, PriceDisplay } from "../atoms";
import { getProductImageUrl } from "@/shared/utils";
import { useCart } from "@/shared/hooks/use-cart";
import { useAuth } from "@/shared/hooks/use-auth";
import { ShoppingCart, Eye, Maximize2 } from "lucide-react";
import { Product } from "@/shared/types/api.types";
import { cn } from "@/shared/utils";

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "list" | "compact";
  showActions?: boolean;
  onQuickView?: (product: Product) => void;
  actions?: React.ReactNode;
  className?: string;
}

export function ProductCard({
  product,
  variant = "grid",
  showActions = false,
  onQuickView,
  actions,
  className,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickViewOverlay, setShowQuickViewOverlay] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(product);
    }
    setShowQuickViewOverlay(true);
  };

  const isCompact = variant === "compact";
  const isList = variant === "list";

  return (
    <Card
      className={cn(
        "group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 shadow-md border-border/50 hover:border-secondary/50 flex h-full",
        isList ? "flex-row" : "flex-col",
        className
      )}
    >
      {/* Card Content */}
      <CardContent
        className={cn(
          "p-0 flex-grow flex",
          isList ? "flex-row w-full" : "flex-col"
        )}
      >
        {/* Product Image */}
        <div
          className={cn(
            "relative overflow-hidden bg-gradient-to-b from-transparent to-black/5 cursor-pointer",
            isList ? "w-48 flex-shrink-0" : "w-full rounded-t-lg",
            isCompact ? "h-40" : "h-56"
          )}
          onClick={handleQuickView}
        >
          <ProductImage
            src={getProductImageUrl(product)}
            alt={product.name}
            discount={product.discount_percentage}
            showRibbon={!isCompact}
            className="w-full h-full"
          />

          {/* Stock Badges */}
          {product.stock_quantity === 0 && (
            <ProductBadge
              text="Out of Stock"
              variant="sale"
              className="absolute top-2 right-2 z-10 bg-red-600 text-white"
            />
          )}
          {product.stock_quantity > 0 &&
            product.stock_quantity <= 5 &&
            !product.is_on_sale &&
            !isCompact && (
              <ProductBadge
                text="Low Stock"
                variant="stock"
                className="absolute top-2 right-2 z-10"
              />
            )}

          {/* Quick View Overlay */}
          {!isCompact && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20">
              <div className="bg-white dark:bg-gray-800 text-primary dark:text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-xl transform scale-90 group-hover:scale-100 transition-all">
                <Maximize2 className="w-5 h-5" />
                <span>Quick View</span>
              </div>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div
          className={cn(
            "flex-grow flex flex-col",
            isList ? "p-4" : "p-4",
            isCompact && "p-3"
          )}
        >
          {/* Category Badge */}
          {product.category_name &&
            product.category_name !== "Uncategorized" &&
            !isCompact && (
              <ProductBadge
                text={product.category_name}
                variant="category"
                className="mb-2 w-fit"
              />
            )}

          {/* Product Name */}
          <h3
            className={cn(
              "font-bold mb-2 line-clamp-2 group-hover:text-secondary transition-colors",
              isCompact ? "text-sm" : "text-lg"
            )}
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Product Description */}
          {!isCompact && (
            <p
              className="text-muted-foreground text-sm mb-3 line-clamp-3 flex-grow"
              title={product.description ?? undefined}
            >
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className={cn("mb-3", isCompact && "mb-2")}>
            <PriceDisplay
              regularPrice={product.regular_price || product.price}
              salePrice={product.sale_price}
              discountPercentage={product.discount_percentage}
              size={isCompact ? "sm" : "lg"}
              showDiscount={!isCompact}
            />
          </div>

          {/* Stock Info */}
          <div className="mt-auto">
            {product.stock_quantity > 0 &&
              product.stock_quantity <= 5 &&
              !isCompact && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-orange-600 font-semibold">
                      Only {product.stock_quantity} left!
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(product.stock_quantity / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}

            {user?.is_admin === true ? (
              <span className="text-sm text-muted-foreground font-medium">
                Stock: {product.stock_quantity}
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                {product.stock_quantity > 0 ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                      In Stock
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-red-700 dark:text-red-400 font-medium">
                      Out of Stock
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Card Footer */}
      <CardFooter
        className={cn(
          "flex flex-col gap-2",
          isCompact ? "p-3 pt-0" : "p-4 pt-0"
        )}
      >
        {/* Custom Actions (for admin) */}
        {showActions && actions ? (
          actions
        ) : (
          <>
            {/* Add to Cart Button */}
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || product.stock_quantity === 0}
              size={isCompact ? "sm" : "lg"}
              className="w-full font-semibold shadow-sm hover:shadow-md transition-shadow"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAdding
                ? "Adding..."
                : product.stock_quantity === 0
                ? "Notify Me"
                : "Add to Cart"}
            </Button>

            {/* View Details Button */}
            {!isCompact && (
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/products/${product.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </Button>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
