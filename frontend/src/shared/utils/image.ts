// ========================================
// IMAGE UTILITY FUNCTIONS
// ========================================

import { API_BASE_URL } from "@/shared/constants/config";

export const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  // Re-base any absolute URL that points to a backend static file
  // This handles domain changes (localhost ↔ api.961shop.com) without DB migrations
  if (imagePath.startsWith("http")) {
    try {
      const url = new URL(imagePath);
      if (url.pathname.startsWith("/static/")) {
        imagePath = url.pathname;
      } else {
        return imagePath;
      }
    } catch {
      return imagePath;
    }
  }
  const normalized = imagePath.startsWith("/static") ? imagePath : `/static${imagePath}`;
  return `${API_BASE_URL}${normalized}`;
};

/**
 * Get product image URL with fallback placeholder
 * @param product - Product object with primary_image_url
 * @returns Image URL or SVG placeholder
 */
export const getProductImageUrl = (product: {
  primary_image_url: string | null;
}): string => {
  const primaryUrl = getImageUrl(product.primary_image_url);
  if (primaryUrl) return primaryUrl;

  // Return optimized SVG placeholder
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2020/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
};
