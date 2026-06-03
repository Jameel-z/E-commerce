/**
 * ProductCard Organism Component
 * Enhanced, configurable product card for grid display
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, Button } from "@/shared/components";
import { ProductImage, ProductBadge, PriceDisplay } from "../atoms";
import { getProductImageUrl, stripHtml } from "@/shared/utils";
import { useCart } from "@/shared/hooks/use-cart";
import { useAuth } from "@/shared/hooks/use-auth";
import { ShoppingCart, Eye, Maximize2, Heart, Check } from "lucide-react";
import { Product } from "@/shared/types/api.types";
import { cn } from "@/shared/utils";
import { useWishlist } from "@/shared/hooks/use-wishlist";
import { useWishlistSidebar } from "@/features/cart/components";

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
  const { addToCart, cart } = useCart();
  const inCart = cart?.items.some((item) => item.product_id === product.id) ?? false;
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { openSidebar: openWishlistSidebar } = useWishlistSidebar();
  const [isAdding, setIsAdding] = useState(false);
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
  };

  const isCompact = variant === "compact";
  const isList = variant === "list";

  const isNew = (() => {
    if (!product.created_at) return false;
    const created = new Date(product.created_at);
    const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  })();

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
            isList ? "w-48 flex-shrink-0 self-stretch" : "w-full rounded-t-lg aspect-square",
            isCompact && "aspect-auto h-40"
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

          {/* Out of Stock bar - bottom of image, never overlaps No Image placeholder */}
          {product.stock_quantity === 0 && (
            <div className="absolute bottom-0 left-0 right-0 z-10 bg-red-600/90 text-white text-xs font-semibold text-center py-1.5 backdrop-blur-sm">
              Out of Stock
            </div>
          )}

          {/* New Badge - only when not on sale (sale ribbon occupies top-left) */}
          {isNew && !isCompact && !product.is_on_sale && product.stock_quantity > 0 && (
            <ProductBadge
              text="New"
              variant="new"
              className="absolute top-2 left-2 z-10"
            />
          )}

          {/* Wishlist Heart Button */}
          {!isCompact && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product);
                openWishlistSidebar();
              }}
              className="absolute top-2 right-2 z-30 p-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow hover:scale-110 transition-transform"
              aria-label={isWishlisted(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={cn(
                  "w-4 h-4 transition-colors",
                  isWishlisted(product.id)
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 hover:text-red-400"
                )}
              />
            </button>
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
            isList ? "p-4" : "px-2.5 py-2"
          )}
        >
          {/* Category Badge — list only */}
          {isList && product.category_name && product.category_name !== "Uncategorized" && (
            <ProductBadge
              text={product.category_name}
              variant="category"
              className="mb-2 w-fit"
            />
          )}

          {/* Product Name */}
          <h3
            className={cn(
              "font-semibold line-clamp-2 group-hover:text-secondary transition-colors",
              isList ? "text-base mb-2" : "text-xs mb-0.5"
            )}
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Product Description */}
          {isList ? (
            <p
              className="text-muted-foreground text-sm mb-3 line-clamp-3 flex-grow"
              title={stripHtml(product.description) || undefined}
            >
              {stripHtml(product.description)}
            </p>
          ) : (
            product.description && (
              <p
                className="text-muted-foreground text-xs mb-1 line-clamp-1"
                title={stripHtml(product.description)}
              >
                {stripHtml(product.description)}
              </p>
            )
          )}

          {/* Price */}
          <div className={cn(isList ? "mb-3" : "mb-0.5")}>
            <PriceDisplay
              regularPrice={product.regular_price || product.price}
              salePrice={product.sale_price}
              discountPercentage={product.discount_percentage}
              size="sm"
              showDiscount={isList}
            />
          </div>

          {/* Stock Info — list only (grid shows inline with button) */}
          {isList && (
            <div className="mt-auto">
              {product.stock_quantity > 0 && product.stock_quantity <= 2 && (
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-orange-600 font-semibold">
                      Only {product.stock_quantity} left!
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${(product.stock_quantity / 2) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              {user?.is_admin === true ? (
                <span className="text-xs text-muted-foreground font-medium">
                  Stock: {product.stock_quantity}
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  {product.stock_quantity > 0 ? (
                    <>
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0" />
                      <span className="text-xs text-green-700 dark:text-green-400 font-medium">In Stock</span>
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="text-xs text-red-700 dark:text-red-400 font-medium">Out of Stock</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Button + Stock inline — grid only */}
          {!isList && (
            <div className="mt-auto pt-1 flex items-center gap-2">
              {showActions && actions ? actions : (
                <>
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAdding || product.stock_quantity === 0}
                    size="sm"
                    className={cn(
                      "flex-1 font-semibold shadow-sm hover:shadow-md transition-all text-xs px-2 h-7 whitespace-nowrap",
                      inCart && !isAdding && product.stock_quantity > 0 && "bg-green-600 hover:bg-green-700 text-white border-green-600"
                    )}
                  >
                    {isAdding ? (
                      <ShoppingCart className="w-3 h-3 mr-1 flex-shrink-0 animate-bounce" />
                    ) : inCart && product.stock_quantity > 0 ? (
                      <Check className="w-3 h-3 mr-1 flex-shrink-0" />
                    ) : (
                      <ShoppingCart className="w-3 h-3 mr-1 flex-shrink-0" />
                    )}
                    {isAdding ? "..." : product.stock_quantity === 0 ? "Sold" : inCart ? "In Cart" : "Add"}
                  </Button>
                  {product.stock_quantity > 0 && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse flex-shrink-0" title="In Stock" />
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Card Footer — list only */}
      {isList && (
        <CardFooter className="flex flex-col gap-2 p-4 pt-0">
          {showActions && actions ? (
            actions
          ) : (
            <>
              <Button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock_quantity === 0}
                size="sm"
                className={cn(
                  "w-full font-semibold shadow-sm hover:shadow-md transition-all",
                  inCart && !isAdding && product.stock_quantity > 0 && "bg-green-600 hover:bg-green-700 text-white border-green-600"
                )}
              >
                {isAdding ? (
                  <ShoppingCart className="w-4 h-4 mr-1.5 animate-bounce" />
                ) : inCart && product.stock_quantity > 0 ? (
                  <Check className="w-4 h-4 mr-1.5" />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-1.5" />
                )}
                {isAdding ? "Adding..." : product.stock_quantity === 0 ? "Out of Stock" : inCart ? "In Cart" : "Add to Cart"}
              </Button>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/products/${product.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Link>
              </Button>
            </>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
