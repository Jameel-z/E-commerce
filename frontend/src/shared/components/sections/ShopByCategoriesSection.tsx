"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { getImageUrl } from "@/shared/utils/image";
import type { Category } from "@/shared/types";

const FALLBACK_GRADIENTS = [
  "from-blue-500 to-blue-700",
  "from-violet-500 to-purple-700",
  "from-rose-500 to-pink-700",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-green-700",
  "from-cyan-500 to-sky-700",
  "from-indigo-500 to-indigo-700",
  "from-fuchsia-500 to-pink-600",
];

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-2xl aspect-[3/2] bg-muted animate-pulse w-full" />
      <div className="h-4 w-3/4 mx-auto bg-muted animate-pulse rounded" />
    </div>
  );
}

export function ShopByCategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .getFeaturedCategories()
      .then((cats) => {
        if (cats.length >= 2) {
          setCategories(cats);
        } else {
          return apiClient.getCategories().then(setCategories);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="pt-5 pb-6 bg-muted/30 min-h-[178px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : categories.map((cat, i) => {
                const imgUrl = cat.image_url ? getImageUrl(cat.image_url) : null;
                const gradient = FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length];

                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${encodeURIComponent(cat.name)}`}
                    className="group flex flex-col gap-2 block"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden rounded-2xl aspect-[3/2] w-full">
                      {imgUrl ? (
                        <Image
                          fill
                          src={imgUrl}
                          alt={cat.name}
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                        />
                      ) : (
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
                      )}
                    </div>

                    {/* Name below image */}
                    <p
                      className="text-center font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 px-1"
                      style={{ fontFamily: "var(--font-poppins)" }}
                    >
                      {cat.name}
                    </p>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
