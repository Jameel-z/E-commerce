import {
  UnifiedLayout,
  HeroSection,
  FeaturesSection,
  FeaturedProductsSection,
  CategoryProductRowsSection,
  ShopByCategoriesSection,
} from "@/shared/components";
import type { Banner } from "@/lib/api";
import type { Category, Product } from "@/shared/types";

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

async function fetchCategories(): Promise<Category[]> {
  try {
    const featured = await fetch(`${API}/categories/featured`, { next: { revalidate: 300 } });
    if (featured.ok) {
      const cats: Category[] = await featured.json();
      if (cats.length >= 2) return cats;
    }
  } catch {}
  try {
    const res = await fetch(`${API}/categories/`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [banners, featuredProducts, categories] = await Promise.all([
    fetchBanners(),
    fetchFeaturedProducts(),
    fetchCategories(),
  ]);

  return (
    <UnifiedLayout>
      <HeroSection banners={banners} />
      <ShopByCategoriesSection initialCategories={categories} />
      <FeaturedProductsSection products={featuredProducts} loading={false} error={null} />
      <CategoryProductRowsSection />
      <FeaturesSection />
    </UnifiedLayout>
  );
}
