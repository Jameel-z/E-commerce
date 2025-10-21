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
import { ShoppingCart, Eye } from "lucide-react";
import { type Product } from "@/shared/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { user } = useAuth();
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

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-secondary/50">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={getProductImageUrl(product)}
            alt={product.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.stock_quantity === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          )}
          {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              Low Stock
            </Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            Category: {product.category_name}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              {user?.is_admin === true ? (
                <span>Stock: {product.stock_quantity}</span>
              ) : (
                <div className="flex items-center gap-2">
                  {product.stock_quantity > 0 ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700 font-medium">
                        In Stock
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-red-700 font-medium">
                        Out of Stock
                      </span>
                    </>
                  )}
                </div>
              )}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex-1 bg-transparent"
        >
          <Link href={`/products/${product.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Link>
        </Button>
        <Button
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0 || isAdding}
          size="sm"
          className="flex-1"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}
