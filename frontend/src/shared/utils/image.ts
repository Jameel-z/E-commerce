// ========================================
// IMAGE UTILITY FUNCTIONS
// ========================================

import { API_BASE_URL } from "@/shared/constants/config";

export const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;

  if (imagePath.startsWith("http")) {
    try {
      const url = new URL(imagePath);
      // Only rebase localhost/127.0.0.1 URLs — those are legacy DB entries from local dev.
      // External server URLs (e.g. api.961shop.com) are already correct; keep them as-is
      // so images load from the live server even when running locally.
      const isLocalhost =
        url.hostname === "localhost" || url.hostname === "127.0.0.1";
      if (!isLocalhost) return imagePath;
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

  return "/placeholder-product.svg";
};
