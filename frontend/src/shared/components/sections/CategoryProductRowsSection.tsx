"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ShoppingCart, Package, Check } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { apiClient, type Product, type Category } from "@/lib/api";
import { getProductImageUrl } from "@/shared/utils/image";
import { useCart } from "@/shared/hooks/use-cart";

function CategoryProductCard({ product }: { product: Product }) {
  const { addToCart, cart } = useCart();
  const [adding, setAdding] = useState(false);
  const inCart = cart?.items.some((item) => item.product_id === product.id) ?? false;

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    try { await addToCart(product.id, 1); } finally { setAdding(false); }
  };

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <div className="rounded-xl overflow-hidden border border-border/50 bg-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
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

        <div className="p-3">
          <h4 className="font-semibold text-sm text-foreground line-clamp-1 mb-1.5 group-hover:text-secondary transition-colors">
            {product.name}
          </h4>
          <div className="flex items-center justify-between gap-2">
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
            <button
              onClick={handleAdd}
              disabled={adding || product.stock_quantity === 0}
              className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
                inCart && !adding && product.stock_quantity > 0
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-secondary/10 hover:bg-secondary text-secondary hover:text-secondary-foreground"
              }`}
            >
              {inCart && !adding && product.stock_quantity > 0
                ? <Check className="w-3 h-3" />
                : <ShoppingCart className="w-3 h-3" />}
              {adding ? "..." : product.stock_quantity === 0 ? "Sold Out" : inCart ? "In Cart" : "Add"}
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

function CategoryRow({ category }: { category: Category }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    Promise.all([
      apiClient.getCategoryRowPins(category.id).catch(() => [] as number[]),
      apiClient.getProducts({ parent_category_id: category.id, per_page: 12 }).catch(() => [] as Product[]),
    ]).then(([pins, all]) => {
      const pinnedSet = new Set(pins);
      const pinned = pins.map((id) => all.find((p) => p.id === id)).filter(Boolean) as Product[];
      const unpinned = all.filter((p) => !pinnedSet.has(p.id));
      setProducts([...pinned, ...unpinned]);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isVisible) return;
    fetchProducts();
  }, [category.id, isVisible]);

  // Refetch when user returns from admin after saving pins
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isVisible) {
        fetchProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [category.id, isVisible]);

  return (
    <section ref={sectionRef} className="py-6 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-5">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-foreground/70">
            {category.name}
          </h2>
          <Link
            href={`/products?category=${encodeURIComponent(category.name)}`}
            className="flex items-center gap-0.5 text-sm font-bold text-foreground/70 hover:text-foreground transition-colors"
          >
            View More <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Skeleton while loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Products */}
        {!loading && products.length > 0 && (
          <Swiper
            spaceBetween={12}
            slidesPerView={2}
            loop={products.length > 2}
            breakpoints={{
              640:  { slidesPerView: 3, spaceBetween: 12 },
              1024: { slidesPerView: 4, spaceBetween: 14 },
              1280: { slidesPerView: 5, spaceBetween: 16 },
            }}
            className="pb-2"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id}>
                <CategoryProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Empty */}
        {!loading && isVisible && products.length === 0 && (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Package className="w-5 h-5 mr-2 opacity-40" />
            <span className="text-sm">No products in this category yet.</span>
          </div>
        )}

      </div>
    </section>
  );
}

export function CategoryProductRowsSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getCategoryRows()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || categories.length === 0) return null;

  return (
    <>
      {categories.map((cat) => (
        <CategoryRow key={cat.id} category={cat} />
      ))}
    </>
  );
}
