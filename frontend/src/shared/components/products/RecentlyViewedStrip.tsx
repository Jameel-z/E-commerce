"use client";

import { useRecentlyViewed } from "@/shared/hooks/use-recently-viewed";
import { ProductCard } from "./organisms/ProductCard";
import { Clock } from "lucide-react";

interface RecentlyViewedStripProps {
  excludeId?: number;
}

export function RecentlyViewedStrip({ excludeId }: RecentlyViewedStripProps) {
  const { items } = useRecentlyViewed();

  const visible = excludeId
    ? items.filter((p) => p.id !== excludeId)
    : items;

  if (visible.length === 0) return null;

  return (
    <section className="py-8">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Recently Viewed</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-muted">
        {visible.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-48">
            <ProductCard product={product} variant="compact" />
          </div>
        ))}
      </div>
    </section>
  );
}
