import type { Banner } from "@/lib/api";
import { HeroSwiperClient } from "./HeroSwiperClient";

export function HeroSection({ banners }: { banners: Banner[] }) {
  return <HeroSwiperClient banners={banners} />;
}
