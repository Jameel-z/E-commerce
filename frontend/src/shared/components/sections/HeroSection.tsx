"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import { Package, Folder } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { getImageUrl } from "@/shared/utils/image";
import type { Category } from "@/shared/types";

const ROTATE_THRESHOLD = 10; // auto-rotate when categories exceed this

function CategoryCircle({ cat, onClick }: { cat: Category; onClick: () => void }) {
  const imgUrl = cat.image_url ? getImageUrl(cat.image_url) : null;
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1.5 group focus:outline-none w-16 sm:w-20"
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 border-border group-hover:border-secondary group-hover:shadow-md transition-all duration-200 bg-muted flex items-center justify-center flex-shrink-0">
        {imgUrl ? (
          <img
            src={imgUrl}
            alt={cat.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
          />
        ) : (
          <Folder className="w-5 h-5 text-muted-foreground group-hover:text-secondary transition-colors duration-200" />
        )}
      </div>
      <span className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200 text-center leading-tight line-clamp-2 w-full">
        {cat.name}
      </span>
    </button>
  );
}

export function HeroSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();

  useEffect(() => {
    apiClient.getCategories().then(setCategories).catch(() => {});
  }, []);

  const handleClick = (name: string) =>
    router.push(`/products?category=${encodeURIComponent(name)}`);

  const shouldRotate = categories.length > ROTATE_THRESHOLD;

  return (
    <section className="relative bg-gradient-to-br from-background via-muted/30 to-secondary/10 overflow-hidden">

      {/* Hero content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 leading-snug">
          Shop <span className="text-secondary">Smart</span>,
          <br />
          Live <span className="text-secondary">Better</span>
        </h1>

        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
          Discover amazing products at unbeatable prices.
        </p>

        <Button size="default" className="px-8" asChild>
          <Link href="/products">
            <Package className="h-4 w-4 mr-2" />
            Start Shopping
          </Link>
        </Button>
      </div>

      {/* ── Category strip ── */}
      {categories.length > 0 && (
        <div className="border-t border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-5">
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.18em] text-center mb-4 font-medium">
              Shop by Category
            </p>

            <Swiper
              modules={[Autoplay]}
              spaceBetween={8}
              slidesPerView="auto"
              centerInsufficientSlides={true}
              autoplay={shouldRotate ? { delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
              loop={shouldRotate}
            >
              {categories.map((cat) => (
                <SwiperSlide key={cat.id} style={{ width: "auto" }} className="!flex justify-center">
                  <CategoryCircle cat={cat} onClick={() => handleClick(cat.name)} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}
    </section>
  );
}
