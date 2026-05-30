"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import type { Banner, BannerPosition } from "@/lib/api";
import { getImageUrl } from "@/shared/utils/image";

type PosCss = { container: string; content: string; gradient: string };

const POSITION_MAP: Record<BannerPosition, PosCss> = {
  "top-left":      { container: "items-start  justify-start",  content: "text-left  pt-[8%] pl-[4%] sm:pl-[6%] lg:pl-[8%]",  gradient: "bg-gradient-to-br from-black/70 via-black/30 to-transparent" },
  "top-center":    { container: "items-start  justify-center", content: "text-center pt-[8%] px-4",                            gradient: "bg-gradient-to-b  from-black/70 via-black/30 to-transparent" },
  "top-right":     { container: "items-start  justify-end",    content: "text-right  pt-[8%] pr-[4%] sm:pr-[6%] lg:pr-[8%]", gradient: "bg-gradient-to-bl from-black/70 via-black/30 to-transparent" },
  "middle-left":   { container: "items-center justify-start",  content: "text-left  pl-[4%] sm:pl-[6%] lg:pl-[8%]",          gradient: "bg-gradient-to-r  from-black/70 via-black/30 to-transparent" },
  "middle-center": { container: "items-center justify-center", content: "text-center px-4",                                    gradient: "bg-gradient-to-t  from-black/65 via-black/25 to-black/10"   },
  "middle-right":  { container: "items-center justify-end",    content: "text-right pr-[4%] sm:pr-[6%] lg:pr-[8%]",          gradient: "bg-gradient-to-l  from-black/70 via-black/30 to-transparent" },
  "bottom-left":   { container: "items-end   justify-start",   content: "text-left  pb-[8%] pl-[4%] sm:pl-[6%] lg:pl-[8%]", gradient: "bg-gradient-to-tr from-black/70 via-black/30 to-transparent" },
  "bottom-center": { container: "items-end   justify-center",  content: "text-center pb-[8%] px-4",                           gradient: "bg-gradient-to-t  from-black/70 via-black/30 to-transparent" },
  "bottom-right":  { container: "items-end   justify-end",     content: "text-right  pb-[8%] pr-[4%] sm:pr-[6%] lg:pr-[8%]", gradient: "bg-gradient-to-tl from-black/70 via-black/30 to-transparent" },
};

const DEFAULT_BANNER: Banner = {
  id: 0,
  title: "Shop Smart, Live Better",
  subtitle: "Discover amazing tech products at unbeatable prices.",
  cta_text: "Start Shopping",
  cta_link: "/products",
  media_url: "",
  media_type: "image",
  text_position: "middle-center",
  hide_overlay: false,
  is_active: true,
  display_order: 0,
};

function BannerSlide({
  banner,
  onVideoEnd,
  priority,
}: {
  banner: Banner;
  onVideoEnd?: () => void;
  priority?: boolean;
}) {
  const mediaUrl = banner.media_url ? getImageUrl(banner.media_url) : null;
  const hasMedia = !!mediaUrl;
  const isVideo = hasMedia && banner.media_type === "video";
  const pos = POSITION_MAP[banner.text_position ?? "middle-center"] ?? POSITION_MAP["middle-center"];
  const hasLink = !!banner.cta_link;
  const hasOverlay = !banner.hide_overlay && (banner.title || banner.subtitle || banner.cta_text);

  const textOverlay = hasOverlay ? (
    <>
      {hasMedia && <div className={`absolute inset-0 ${pos.gradient}`} />}
      <div className={`absolute inset-0 flex ${pos.container}`}>
        <div className={`max-w-2xl ${pos.content} ${hasMedia ? "text-white" : "text-foreground"}`}>
          {banner.title && (
            <h1 className={`text-[clamp(0.85rem,3.5vw,3.75rem)] font-bold mb-[0.4em] leading-tight tracking-tight drop-shadow-md ${hasMedia ? "text-white" : ""}`}>
              {banner.title}
            </h1>
          )}
          {banner.subtitle && (
            <p className={`text-[clamp(0.6rem,1.5vw,1.25rem)] mb-[0.8em] leading-relaxed drop-shadow-sm ${hasMedia ? "text-white/90" : "text-muted-foreground"}`}>
              {banner.subtitle}
            </p>
          )}
          {banner.cta_text && (
            <span className={`inline-flex items-center gap-2 px-[clamp(0.6rem,2.5vw,2rem)] py-[clamp(0.3rem,1vw,0.75rem)] text-[clamp(0.6rem,1.3vw,1rem)] font-semibold rounded-full shadow-lg pointer-events-none select-none ${hasMedia ? "bg-white text-foreground" : "bg-primary text-primary-foreground"}`}>
              <ShoppingBag className="h-[1em] w-[1em]" />
              {banner.cta_text}
            </span>
          )}
        </div>
      </div>
    </>
  ) : null;

  if (hasMedia) {
    const media = isVideo ? (
      <video src={mediaUrl!} autoPlay muted playsInline onEnded={onVideoEnd} className="w-full h-auto block" />
    ) : (
      <Image
        src={mediaUrl!}
        alt={banner.title ?? "Banner"}
        width={1920}
        height={1080}
        style={{ width: "100%", height: "auto", display: "block" }}
        priority={priority}
        fetchPriority={priority ? "high" : "auto"}
        sizes="100vw"
      />
    );

    const inner = (
      <div className="relative w-full overflow-hidden">
        {media}
        {textOverlay}
      </div>
    );

    if (hasLink) {
      return (
        <Link href={banner.cta_link!} className="block group cursor-pointer" aria-label={banner.cta_text ?? banner.title ?? "View offer"}>
          {inner}
        </Link>
      );
    }
    return inner;
  }

  const fallback = (
    <div className={`relative w-full flex min-h-[180px] sm:min-h-[280px] lg:min-h-[420px] overflow-hidden ${pos.container} bg-gradient-to-br from-background via-muted/40 to-secondary/15`}>
      {hasOverlay && (
        <div className={`max-w-2xl ${pos.content} text-foreground`}>
          {banner.title && (
            <h1 className="text-[clamp(1.25rem,4vw,3.75rem)] font-bold mb-[0.4em] leading-tight tracking-tight">{banner.title}</h1>
          )}
          {banner.subtitle && (
            <p className="text-[clamp(0.75rem,1.8vw,1.25rem)] mb-[0.8em] leading-relaxed text-muted-foreground">{banner.subtitle}</p>
          )}
          {banner.cta_text && (
            <span className="inline-flex items-center gap-2 px-[clamp(0.75rem,3vw,2rem)] py-[clamp(0.4rem,1.2vw,0.75rem)] text-[clamp(0.75rem,1.5vw,1rem)] font-semibold rounded-full shadow-lg pointer-events-none select-none bg-primary text-primary-foreground">
              <ShoppingBag className="h-[1em] w-[1em]" />
              {banner.cta_text}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (hasLink) {
    return (
      <Link href={banner.cta_link!} className="block group cursor-pointer" aria-label={banner.cta_text ?? banner.title ?? "View offer"}>
        {fallback}
      </Link>
    );
  }
  return fallback;
}

export function HeroSwiperClient({ banners }: { banners: Banner[] }) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const slides = banners.length > 0 ? banners : [DEFAULT_BANNER];
  const multi = slides.length > 1;

  const handleSlideChange = (swiper: SwiperType) => {
    const active = slides[swiper.realIndex];
    if (active?.media_type === "video") swiper.autoplay.stop();
    else swiper.autoplay.start();
  };

  const handleVideoEnd = () => {
    if (!swiperRef.current) return;
    swiperRef.current.slideNext();
    swiperRef.current.autoplay.start();
  };

  return (
    <section className="relative w-full overflow-hidden group/hero">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        speed={700}
        autoplay={multi ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true } : false}
        loop={multi}
        navigation={multi ? { prevEl: prevRef.current, nextEl: nextRef.current } : false}
        pagination={multi ? { clickable: true, dynamicBullets: true } : false}
        onSlideChange={multi ? handleSlideChange : undefined}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          if (multi && slides[0]?.media_type === "video") swiper.autoplay.stop();
          if (multi && swiper.params.navigation && typeof swiper.params.navigation === "object") {
            (swiper.params.navigation as { prevEl: HTMLButtonElement | null; nextEl: HTMLButtonElement | null }).prevEl = prevRef.current;
            (swiper.params.navigation as { prevEl: HTMLButtonElement | null; nextEl: HTMLButtonElement | null }).nextEl = nextRef.current;
            swiper.navigation.destroy();
            swiper.navigation.init();
            swiper.navigation.update();
          }
        }}
        className="w-full [&_.swiper-pagination-bullet]:bg-white [&_.swiper-pagination-bullet-active]:bg-white [&_.swiper-pagination]:bottom-4"
      >
        {slides.map((banner, i) => (
          <SwiperSlide key={banner.id || i}>
            <BannerSlide banner={banner} onVideoEnd={multi ? handleVideoEnd : undefined} priority={i === 0} />
          </SwiperSlide>
        ))}
      </Swiper>

      {multi && (
        <>
          <button ref={prevRef} aria-label="Previous slide" className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white border border-white/20 shadow-lg opacity-0 group-hover/hero:opacity-100 transition-all duration-300 hover:scale-110">
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button ref={nextRef} aria-label="Next slide" className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white border border-white/20 shadow-lg opacity-0 group-hover/hero:opacity-100 transition-all duration-300 hover:scale-110">
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </>
      )}
    </section>
  );
}
