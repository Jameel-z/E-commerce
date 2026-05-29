import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://961shop.com";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Revalidate sitemap every 24 hours so new products are picked up automatically
export const revalidate = 86400;

interface Product {
  id: number;
  updated_at?: string | null;
  created_at: string;
}

async function getAllProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_URL}/products/?per_page=1000`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/products/${product.id}`,
    lastModified: new Date(product.updated_at ?? product.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
