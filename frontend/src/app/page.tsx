import {
  UnifiedLayout,
  HeroSection,
  FeaturesSection,
  FeaturedProductsSection,
  CategoryProductRowsSection,
  ShopByCategoriesSection,
} from "@/shared/components";
import type { Banner } from "@/lib/api";
import type { Product } from "@/shared/types";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function fetchBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${API}/banners/`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API}/products/featured`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [banners, featuredProducts] = await Promise.all([
    fetchBanners(),
    fetchFeaturedProducts(),
  ]);

  return (
    <UnifiedLayout>
      <HeroSection banners={banners} />
      <ShopByCategoriesSection />
      <FeaturedProductsSection products={featuredProducts} loading={false} error={null} />
      <CategoryProductRowsSection />
      <FeaturesSection />
    </UnifiedLayout>
  );
}
