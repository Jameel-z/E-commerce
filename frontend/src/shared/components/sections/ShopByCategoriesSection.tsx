"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Folder } from "lucide-react";
import { apiClient } from "@/lib/api";
import { getImageUrl } from "@/shared/utils/image";
import type { Category } from "@/shared/types";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

export function ShopByCategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    apiClient.getCategories().then(setCategories).catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  const handleCategoryClick = (name: string) => {
    router.push(`/products?category=${encodeURIComponent(name)}`);
  };

  return (
    <section className="py-6 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-6">
          Shop by Category
        </h2>

        <Swiper
          modules={[FreeMode]}
          slidesPerView="auto"
          spaceBetween={24}
          freeMode={true}
          className="!overflow-hidden"
        >
          {categories.map((cat) => {
            const imgUrl = cat.image_url ? getImageUrl(cat.image_url) : null;
            return (
              <SwiperSlide key={cat.id} style={{ width: "auto" }}>
                <button
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-16 h-16 rounded-full bg-muted border-2 border-transparent group-hover:border-primary group-hover:scale-105 transition-all duration-200 flex items-center justify-center"
                    style={imgUrl ? {
                      backgroundImage: `url(${imgUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    } : {}}
                  >
                    {!imgUrl && (
                      <Folder className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-center text-foreground group-hover:text-primary transition-colors w-16 truncate">
                    {cat.name}
                  </span>
                </button>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
