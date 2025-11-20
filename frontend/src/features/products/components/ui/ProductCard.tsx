"use client";

import {
  Card,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from "@/shared/components";
import { getProductImageUrl } from "@/shared/utils";
import { useCart } from "@/shared/hooks/use-cart";
import { useAuth } from "@/shared/hooks/use-auth";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Eye, Maximize2 } from "lucide-react";
import { type Product } from "@/shared/types";
import { QuickViewModal } from "./QuickViewModal";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

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

  return (
    <Card className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 shadow-md border-border/50 hover:border-secondary/50 flex flex-col h-full">
      {/* Card Content */}
      <CardContent className="p-0 flex-grow flex flex-col">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-t-lg bg-gradient-to-b from-transparent to-black/5 cursor-pointer">
          <Image
            src={getProductImageUrl(product)}
            alt={product.name}
            width={300}
            height={224}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
            onClick={(e) => {
              e.preventDefault();
              console.log("Image clicked, opening quick view for:", product.id);
              setShowQuickView(true);
            }}
          />
          {/* Stock Badges */}
          {product.stock_quantity === 0 && (
            <Badge
              variant="destructive"
              className="absolute top-2 right-2 z-10 pointer-events-none"
            >
              Out of Stock
            </Badge>
          )}
          {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
            <Badge
              variant="secondary"
              className="absolute top-2 right-2 z-10 pointer-events-none"
            >
              Low Stock
            </Badge>
          )}

          {/* Quick View Overlay - Appears on Hover */}
          <div
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Overlay clicked for product:", product.id);
              setShowQuickView(true);
            }}
          >
            <div className="bg-white dark:bg-gray-800 text-primary dark:text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-xl transform scale-90 group-hover:scale-100 transition-all hover:scale-105 cursor-pointer select-none">
              <Maximize2 className="w-5 h-5" />
              <span>Quick View</span>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-4 flex-grow flex flex-col">
          {/* Category Badge */}
          {product.category_name && (
            <Badge variant="outline" className="mb-2 w-fit text-xs">
              {product.category_name}
            </Badge>
          )}

          {/* Product Name */}
          <h3
            className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-secondary transition-colors"
            title={product.name} // Tooltip for truncated text
          >
            {product.name}
          </h3>

          {/* Product Description */}
          <p
            className="text-muted-foreground text-sm mb-3 line-clamp-1 flex-grow"
            title={product.description ?? undefined} // Tooltip for truncated text
          >
            {product.description}
          </p>

          {/* Price */}
          <div className="mb-3">
            <span className="text-2xl font-extrabold text-primary group-hover:text-secondary transition-colors">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          {/* Stock Info */}
          <div className="mt-auto">
            {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
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
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        {/* Primary Action - Add to Cart */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          size="lg"
          className="w-full font-semibold shadow-sm hover:shadow-md transition-shadow"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isAdding
            ? "Adding..."
            : product.stock_quantity === 0
            ? "Notify Me"
            : "Add to Cart"}
        </Button>

        {/* Secondary Action - View Details */}
        <Button variant="outline" size="sm" asChild className="w-full">
          <Link href={`/products/${product.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Link>
        </Button>
      </CardFooter>

      {/* Quick View Modal */}
      <QuickViewModal
        productId={product.id}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </Card>
  );
}
