// Shared Utilities - Barrel Export
export { getImageUrl, getProductImageUrl } from "./image";
export { cn, getDisplayName, getUserInitials, isAdmin } from "./utils";
export * from "./product.utils";

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
