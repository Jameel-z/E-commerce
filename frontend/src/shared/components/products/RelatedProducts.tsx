"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import type { Product } from "@/shared/types";
import { ProductCard } from "./organisms/ProductCard";
import { Layers } from "lucide-react";

interface RelatedProductsProps {
  categoryId: number;
  excludeId: number;
  categoryName?: string;
}

export function RelatedProducts({
  categoryId,
  excludeId,
  categoryName,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    apiClient
      .getProducts({ category_id: categoryId, per_page: 10 })
      .then((data) => setProducts(data.filter((p) => p.id !== excludeId).slice(0, 6)))
      .catch(() => {});
  }, [categoryId, excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">
          More from{" "}
          <span className="text-primary">{categoryName || "this category"}</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} variant="compact" />
        ))}
      </div>
    </section>
  );
}
