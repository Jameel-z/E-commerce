"use client";

import { useEffect } from "react";
import { useWishlist } from "@/shared/hooks/use-wishlist";
import { useCart } from "@/shared/hooks/use-cart";
import { X, Heart, ShoppingCart, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { getProductImageUrl } from "@/shared/utils/image";
import Link from "next/link";
import { useState } from "react";

interface WishlistSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistSidebar({ isOpen, onClose }: WishlistSidebarProps) {
  const { items, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleAddToCart = async (productId: number) => {
    setAddingId(productId);
    try { await addToCart(productId, 1); } finally { setAddingId(null); }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-screen w-72 bg-card shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted flex-shrink-0">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            <div>
              <h2 className="text-sm font-bold text-card-foreground leading-tight">Wishlist</h2>
              {items.length > 0 && (
                <p className="text-xs text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close wishlist"
            className="h-7 w-7 flex items-center justify-center rounded-md border border-muted-foreground/40 hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <Heart className="h-12 w-12 text-muted-foreground opacity-30 mb-3" />
              <p className="text-sm font-medium text-card-foreground mb-1">Your wishlist is empty</p>
              <p className="text-xs text-muted-foreground mb-4">Save products you love to find them later</p>
              <Button size="sm" onClick={onClose} asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((product) => (
                <div key={product.id} className="flex gap-3 p-3 hover:bg-muted/30 transition-colors">
                  {/* Image */}
                  <Link href={`/products/${product.id}`} onClick={onClose} className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg border bg-white overflow-hidden">
                      <img
                        src={getProductImageUrl(product)}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${product.id}`} onClick={onClose}>
                      <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug hover:text-primary transition-colors">
                        {product.name}
                      </p>
                    </Link>
                    <div className="flex items-center gap-1.5 mt-1">
                      {product.is_on_sale && product.sale_price ? (
                        <>
                          <span className="text-sm font-bold text-primary">${product.sale_price}</span>
                          <span className="text-xs text-muted-foreground line-through">${product.regular_price}</span>
                        </>
                      ) : (
                        <span className="text-sm font-bold text-foreground">${product.price}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        disabled={addingId === product.id || product.stock_quantity === 0}
                        className="flex items-center gap-1 text-[10px] font-semibold bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        {addingId === product.id ? "Adding…" : product.stock_quantity === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-muted px-3 py-2.5 flex-shrink-0 space-y-2">
            <Button variant="outline" size="sm" asChild className="w-full gap-1.5">
              <Link href="/wishlist" onClick={onClose}>
                <ExternalLink className="h-3.5 w-3.5" />
                View Full Wishlist
              </Link>
            </Button>
            <button
              onClick={clearWishlist}
              className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors py-1"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
}
