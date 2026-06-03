"use client";

import { Button } from "@/shared/components";
import { QuantitySelector } from "@/features/products/components";
import { type ProductDetail } from "@/lib/api";
import { useWishlist } from "@/shared/hooks/use-wishlist";
import { useCart } from "@/shared/hooks/use-cart";
import { ShoppingCart, Heart, Check } from "lucide-react";
import { CONTACT } from "@/shared/constants/config";

interface AddToCartSectionProps {
  product: ProductDetail;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  className?: string;
}

export function AddToCartSection({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAddingToCart,
  className = "",
}: AddToCartSectionProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { cart } = useCart();
  const wishlisted = isWishlisted(product.id);
  const inCart = cart?.items.some((item) => item.product_id === product.id) ?? false;

  const meta = [
    product.sku       ? { label: "SKU",        value: product.sku }               : null,
    product.condition ? { label: "Condition",  value: product.condition }         : null,
    product.tags      ? { label: "Tag",        value: product.tags }              : null,
    product.brand     ? { label: "Brand",      value: product.brand, bold: true }  : null,
    product.shipping  ? { label: "Shipping",   value: product.shipping }          : null,
    product.vat       ? { label: "VAT",        value: product.vat }               : null,
  ].filter(Boolean) as { label: string; value: string; bold?: boolean }[];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quantity + Add to Cart inline */}
      <div className="flex flex-wrap items-end gap-3">
        <QuantitySelector
          quantity={quantity}
          maxQuantity={100}
          onQuantityChange={onQuantityChange}
        />
        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className={`h-10 px-6 font-bold tracking-widest uppercase text-sm shrink-0 transition-all ${inCart && !isAddingToCart ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : ""}`}
          size="md"
        >
          {isAddingToCart ? (
            <ShoppingCart className="h-4 w-4 mr-2 animate-bounce" />
          ) : inCart ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          {isAddingToCart ? "Adding..." : inCart ? "In Cart" : product.stock_quantity === 0 ? "Add to Cart Anyway" : "Add to Cart"}
        </Button>
      </div>

      {/* Add to wishlist */}
      <button
        type="button"
        onClick={() =>
          toggleWishlist({
            id: product.id,
            name: product.name,
            price: parseFloat(product.price) || 0,
            primary_image_url: product.primary_image_url,
            category_name: product.category?.name ?? "",
            stock_quantity: product.stock_quantity,
            description: typeof product.description === "string" ? product.description : null,
            regular_price: product.regular_price ? parseFloat(product.regular_price) : null,
            sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
            is_on_sale: product.is_on_sale,
            discount_percentage: product.discount_percentage,
            created_at: product.created_at,
          })
        }
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Heart
          className={`h-5 w-5 transition-colors ${wishlisted ? "fill-red-500 text-red-500" : ""}`}
        />
        Add to wishlist
      </button>

      {/* SKU / Categories / Tag / Brand / Condition / Shipping / VAT */}
      {meta.length > 0 && (
        <div>
          {meta.map(({ label, value, bold }) => (
            <div
              key={label}
              className="flex items-baseline gap-3 py-1"
            >
              <span className="w-24 shrink-0 text-xs font-bold uppercase tracking-wide text-foreground">
                {label}:
              </span>
              {bold ? (
                <strong className="text-xs text-foreground">{value}</strong>
              ) : (
                <span className="text-xs text-muted-foreground">{value}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp CTA */}
      <a
        href={`https://wa.me/${CONTACT.phone.tel.replace(/\D/g, "")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2 rounded-md text-white text-sm font-semibold transition-opacity hover:opacity-90 w-fit"
        style={{ backgroundColor: "#25D366" }}
      >
        <svg viewBox="0 0 32 32" fill="white" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.47.677 4.782 1.854 6.76L2 30l7.438-1.82A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 01-5.795-1.574l-.415-.246-4.415 1.08 1.115-4.296-.27-.44A11.46 11.46 0 014.5 16C4.5 9.596 9.596 4.5 16 4.5S27.5 9.596 27.5 16 22.404 27.5 16 27.5zm6.29-8.61c-.345-.173-2.04-1.006-2.355-1.12-.316-.115-.546-.173-.776.173-.23.345-.892 1.12-1.094 1.35-.2.23-.403.26-.748.087-2.04-1.02-3.38-1.82-4.723-4.128-.356-.614.356-.57 1.018-1.896.113-.23.057-.432-.03-.605-.087-.173-.776-1.87-1.063-2.561-.28-.672-.565-.58-.776-.59l-.66-.012c-.23 0-.604.087-.92.432-.316.345-1.207 1.18-1.207 2.877s1.236 3.34 1.408 3.57c.173.23 2.432 3.71 5.892 5.21.823.355 1.465.567 1.965.726.826.263 1.578.226 2.172.137.662-.099 2.04-.834 2.327-1.638.287-.805.287-1.496.2-1.64-.083-.14-.316-.23-.66-.403z"/>
        </svg>
        Contact Us on WhatsApp
      </a>
    </div>
  );
}
