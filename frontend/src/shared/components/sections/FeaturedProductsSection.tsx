"use client";

import Image from "next/image";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Package } from "lucide-react";
import { type Product } from "@/shared/types";
import { getProductImageUrl } from "@/shared/utils/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { useCart } from "@/shared/hooks/use-cart";
import { useState } from "react";

interface FeaturedProductsSectionProps {
  products: Product[];
  loading: boolean;
  error: string | null;
}

function FeaturedCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    try { await addToCart(product.id, 1); } finally { setAdding(false); }
  };

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="rounded-xl overflow-hidden border border-border/50 bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        {/* Image */}
        <div className="aspect-[4/3] relative overflow-hidden bg-muted">
          <Image
            fill
            src={getProductImageUrl(product)}
            alt={product.name}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />
          {product.is_on_sale && product.discount_percentage && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              -{product.discount_percentage}%
            </span>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h4 className="font-semibold text-sm text-foreground line-clamp-1 mb-1.5 group-hover:text-secondary transition-colors">
            {product.name}
          </h4>

          <div className="flex items-center justify-between gap-2">
            {/* Price */}
            <div className="min-w-0">
              {product.is_on_sale && product.sale_price ? (
                <div className="flex items-baseline gap-1">
                  <span className="text-sm font-bold text-secondary">${product.sale_price}</span>
                  <span className="text-[10px] text-muted-foreground line-through">${product.regular_price}</span>
                </div>
              ) : (
                <span className="text-sm font-bold text-foreground">${product.price}</span>
              )}
            </div>

            {/* Add to cart */}
            <button
              onClick={(e) => { e.preventDefault(); handleAdd(); }}
              disabled={adding || product.stock_quantity === 0}
              className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold bg-secondary/10 hover:bg-secondary text-secondary hover:text-secondary-foreground px-2 py-1 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-3 h-3" />
              {adding ? "..." : product.stock_quantity === 0 ? "Sold Out" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl overflow-hidden border border-border/50 bg-card animate-pulse">
      <div className="aspect-[4/3] bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </div>
    </div>
  );
}

export function FeaturedProductsSection({ products, loading, error }: FeaturedProductsSectionProps) {
  const featured = products.slice(0, 10);

  return (
    <section className="py-8 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold text-foreground">Featured Products</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Explore our best-selling items</p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Products */}
        {!loading && featured.length > 0 && (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={12}
            slidesPerView={2}
            breakpoints={{
              640:  { slidesPerView: 3, spaceBetween: 12 },
              1024: { slidesPerView: 4, spaceBetween: 14 },
              1280: { slidesPerView: 5, spaceBetween: 16 },
            }}
            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            pagination={{ clickable: true }}
            loop={featured.length > 5}
            className="!pb-8"
          >
            {featured.map((product) => (
              <SwiperSlide key={product.id}>
                <FeaturedCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* View All — below dots */}
        {!loading && featured.length > 0 && (
          <div className="text-center mt-2">
            <Button variant="ghost" size="sm" asChild className="text-secondary hover:text-secondary gap-1">
              <Link href="/products">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        )}

        {/* Empty */}
        {!loading && featured.length === 0 && !error && (
          <div className="text-center py-10 text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No products yet — check back soon.</p>
            <Button variant="outline" size="sm" className="mt-4" asChild>
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
