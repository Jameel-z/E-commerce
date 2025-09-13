"use client";

import { useAuth } from "@/shared/hooks/use-auth";
import { useEffect, useState } from "react";
import { apiClient, type Product } from "@/lib/api";
import {
  Header,
  HeroSection,
  ErrorBanner,
  FeaturesSection,
  QuickAccessSection,
  FeaturedProductsSection,
} from "@/shared/components";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        console.log("Fetching products from API...");
        const products = await apiClient.getProducts();
        console.log("Successfully fetched products:", products.length);
        setFeaturedProducts(products.slice(0, 6));
        setError(null);
      } catch (error) {
        console.error("Failed to fetch products:", error);
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
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <HeroSection />
      {error && <ErrorBanner error={error} />}
      <FeaturedProductsSection
        products={featuredProducts}
        loading={productsLoading}
        error={error}
      />
      <FeaturesSection />
      <QuickAccessSection user={user} />
    </div>
  );
}
