"use client";

import { useWishlist } from "@/shared/hooks/use-wishlist";
import { useCart } from "@/shared/hooks/use-cart";
import { ProductCard } from "@/shared/components/products/organisms/ProductCard";
import { UnifiedLayout } from "@/shared/components";
import { Button } from "@/shared/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";

export default function WishlistPage() {
  const { items, clearWishlist, count } = useWishlist();
  const { addToCart } = useCart();

  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: { label: "Back to Products", href: "/products" },
        title: "My Wishlist",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save products you love to come back to them later.
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">
                {count} {count === 1 ? "item" : "items"} saved
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearWishlist}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Wishlist
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="grid"
                />
              ))}
            </div>
          </>
        )}
      </div>
    </UnifiedLayout>
  );
}
