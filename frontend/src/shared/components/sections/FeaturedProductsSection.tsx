"use client";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import Link from "next/link";
import { Package } from "lucide-react";
import { type Product } from "@/shared/types";
import { getProductImageUrl } from "@/shared/utils/image";

interface FeaturedProductsSectionProps {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function FeaturedProductsSection({
  products,
  loading,
  error,
}: FeaturedProductsSectionProps) {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Featured Products
          </h3>
          <p className="text-muted-foreground">
            Explore our best-selling items
          </p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded mb-4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="hover:shadow-lg transition-shadow border-0 bg-card/50 backdrop-blur-sm overflow-hidden"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={getProductImageUrl(product)}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-lg mb-2 line-clamp-1">
                    {product.name}
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-secondary">
                      ${product.price}
                    </span>
                    <Button size="sm" asChild>
                      <Link href={`/products/${product.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !error ? (
          <div className="text-center py-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No Products Available
                </h3>
                <p className="text-muted-foreground mb-4">
                  Check back later for new products or browse our full catalog.
                </p>
                <Button asChild>
                  <Link href="/products">Browse All Products</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="text-center mt-8">
          <Button size="lg" variant="outline" asChild>
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
