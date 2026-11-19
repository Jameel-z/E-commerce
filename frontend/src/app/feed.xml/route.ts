import { NextResponse } from "next/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://961shop.com";
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  primary_image_url: string | null;
  stock_quantity: number;
  brand: string | null;
  condition: string | null;
  sku: string | null;
  vat: string | null;
  category_name: string;
  updated_at?: string | null;
  created_at: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);
}

function normalizeCondition(value: string | null): "new" | "refurbished" | "used" {
  const v = (value || "").toLowerCase();
  if (v.includes("refurb")) return "refurbished";
  if (v.includes("used")) return "used";
  return "new";
}

function getGoogleCategory(categoryName: string): string {
  const name = categoryName.toLowerCase();
  if (name.includes("laptop") || name.includes("computer") || name.includes("pc")) return "Electronics > Computers > Laptops";
  if (name.includes("monitor") || name.includes("display") || name.includes("screen")) return "Electronics > Video > Monitors";
  if (name.includes("cctv") || name.includes("camera") || name.includes("security")) return "Electronics > Security > Security Cameras";
  if (name.includes("router") || name.includes("mikrotik") || name.includes("wifi") || name.includes("network") || name.includes("switch")) return "Electronics > Networking";
  if (name.includes("accessory") || name.includes("accessories") || name.includes("cable")) return "Electronics > Electronics Accessories";
  if (name.includes("gaming")) return "Electronics > Video Game Consoles & Accessories";
  if (name.includes("phone") || name.includes("mobile")) return "Electronics > Communications > Phones";
  return "Electronics";
}

export async function GET() {
  let products: Product[] = [];

  try {
    const res = await fetch(`${API_URL}/products/?per_page=1000`, {
      next: { revalidate: 86400 },
    });
    if (res.ok) {
      products = await res.json();
    }
  } catch {
    products = [];
  }

  const items = products
    .map((product) => {
      const title = escapeXml(product.name);
      const description = escapeXml(
        stripHtml(product.description || "") || product.name
      );
      const link = `${SITE_URL}/products/${product.id}`;
      const imageLink = product.primary_image_url || "";
      // Prices on the site already include Lebanese VAT, and outside the US
      // Google requires the feed price to include tax, so send it unchanged.
      const priceUSD = Number(product.price).toFixed(2);
      const availability =
        product.stock_quantity > 0 ? "in_stock" : "out_of_stock";
      const condition = normalizeCondition(product.condition);
      // Never fall back to the store name: a missing brand is left out rather
      // than claiming 961shop makes the product.
      const brandTag = product.brand?.trim()
        ? `<g:brand>${escapeXml(product.brand.trim())}</g:brand>`
        : "";
      // Keep IDs stable so Merchant Center keeps each item's history.
      const id = `product-${product.id}`;
      const googleCategory = getGoogleCategory(product.category_name);

      return `
  <entry>
    <g:id>${escapeXml(id)}</g:id>
    <g:title>${title}</g:title>
    <g:description>${description}</g:description>
    <g:link>${link}</g:link>
    ${imageLink ? `<g:image_link>${escapeXml(imageLink)}</g:image_link>` : ""}
    <g:availability>${availability}</g:availability>
    <g:price>${priceUSD} USD</g:price>
    ${brandTag}
    <g:condition>${condition}</g:condition>
    <g:google_product_category>${googleCategory}</g:google_product_category>
  </entry>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">
  <title>961shop.com Products</title>
  <link href="${SITE_URL}"/>
  <updated>${new Date().toISOString()}</updated>
${items}
</feed>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
