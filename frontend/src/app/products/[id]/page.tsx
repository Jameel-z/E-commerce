import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ProductDetail } from "@/lib/api";
import { API_BASE_URL } from "@/shared/constants/config";
import { getProductSchema, getBreadcrumbSchema } from "@/shared/utils/schema";
import { ProductDetailClient } from "./ProductDetailClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://961shop.com";

// Re-fetch product data at most once a minute, so admin price/stock changes
// show up quickly while crawlers still get a fully rendered page.
const REVALIDATE_SECONDS = 60;

// Loaded on the server so the product name, price, stock and structured data
// are in the HTML that Google's crawler receives. cache() shares one request
// between generateMetadata and the page.
const getProduct = cache(async (id: string): Promise<ProductDetail | null> => {
  if (!/^\d+$/.test(id)) return null;
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to load product ${id}: ${res.status}`);
  }
  return res.json();
});

function plainText(html: string | null | undefined, maxLength: number): string {
  const text = (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trimEnd()}…` : text;
}

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) {
    return { title: "Product not found | 961shop", robots: { index: false } };
  }

  const url = `${SITE_URL}/products/${product.id}`;
  const description = plainText(product.description, 160) || product.name;

  return {
    title: `${product.name} | 961shop`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description,
      url,
      siteName: "961shop",
      type: "website",
      images: product.primary_image_url ? [{ url: product.primary_image_url }] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  const breadcrumbItems = [
    { name: "Home", url: SITE_URL },
    { name: "Products", url: `${SITE_URL}/products` },
    ...(product.category
      ? [{ name: product.category.name, url: `${SITE_URL}/products?category=${product.category_id}` }]
      : []),
    { name: product.name, url: `${SITE_URL}/products/${product.id}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getProductSchema(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema(breadcrumbItems)) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
