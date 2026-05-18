"use client";

import { useAuth } from "@/shared/hooks/use-auth";
import { useEffect, useState } from "react";
import { apiClient, type Product } from "@/lib/api";
import {
  UnifiedLayout,
  HeroSection,
  ErrorBanner,
  FeaturesSection,
  QuickAccessSection,
  FeaturedProductsSection,
  CategoryProductRowsSection,
} from "@/shared/components";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const featured = await apiClient.getFeaturedProducts();
        setFeaturedProducts(featured);
        setError(null);
      } catch {
        setError(
          "Unable to load products. Please check if the backend server is running."
        );
      } finally {
        setProductsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <UnifiedLayout>
      <HeroSection />
      {error && <ErrorBanner error={error} />}
      <FeaturedProductsSection
        products={featuredProducts}
        loading={productsLoading}
        error={error}
      />
      <CategoryProductRowsSection />
      <FeaturesSection />
      <QuickAccessSection user={user} />
    </UnifiedLayout>
  );
}
