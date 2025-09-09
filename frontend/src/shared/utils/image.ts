// ========================================
// IMAGE UTILITY FUNCTIONS
// ========================================

import { API_BASE_URL } from "@/shared/constants/config";

/**
 * Convert backend image path to full URL
 * @param imagePath - Relative path from backend
 * @returns Full URL or null if no path
 */
export const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
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
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
};
