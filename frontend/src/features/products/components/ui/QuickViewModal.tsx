"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { apiClient, type ProductDetail } from "@/lib/api";
import { useCart } from "@/shared/hooks/use-cart";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2, AlertCircle, ShoppingCart, ExternalLink } from "lucide-react";
import { Button } from "@/shared/components/ui";
import Link from "next/link";
import Image from "next/image";

interface QuickViewModalProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({ productId, isOpen, onClose }: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fetchProduct = async () => {
    if (!productId) return;
    setLoading(true);
    setError(false);
    try {
      const data = await apiClient.getProduct(productId);
      setProduct(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchProduct();
    }
    if (!isOpen) {
      setQuantity(1);
      setProduct(null);
      setSelectedIndex(0);
      setLoading(false);
      setError(false);
    }
  }, [isOpen, productId]);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast({ title: "Added to Cart", description: `${quantity}× ${product.name} added.` });
      onClose();
    } catch {
      toast({ title: "Error", description: "Failed to add item. Please try again.", variant: "destructive" });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const allImages = product
    ? [
        { id: "primary", url: product.primary_image_url },
        ...(product.images || []).map((img) => ({ id: String(img.id), url: img.url })),
      ].filter((img) => img.url)
    : [];

  const mainImage = allImages[selectedIndex]?.url || "/placeholder.svg";

  const regularPrice = product?.regular_price || product?.price;
  const salePrice = product?.sale_price;
  const discount = product?.discount_percentage;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-[95vw] p-0 overflow-hidden gap-0 max-h-[92vh] sm:max-h-[85vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>{product?.name || "Product Details"}</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-64 px-6 gap-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-muted-foreground text-center">Unable to load product details.</p>
            <div className="flex gap-2">
              <Button size="sm" onClick={fetchProduct}>Try Again</Button>
              <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        )}

        {!loading && !error && product && (
          <div className="flex flex-col sm:grid sm:grid-cols-2 overflow-y-auto sm:overflow-hidden sm:max-h-[75vh]">

            {/* Top / Left — Image */}
            <div className="flex flex-col bg-muted/20 sm:border-r border-b sm:border-b-0">
              {/* Main image */}
              <div className="flex items-center justify-center p-4 sm:flex-1 sm:overflow-hidden sm:min-h-0">
                <Image
                  src={mainImage}
                  alt={product.name}
                  width={300}
                  height={280}
                  className="max-h-[200px] sm:max-h-[280px] w-auto object-contain"
                  priority
                />
              </div>

              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="flex gap-2 p-2.5 overflow-x-auto border-t bg-background flex-shrink-0">
                  {allImages.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedIndex(i)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-md border-2 overflow-hidden transition-all ${
                        i === selectedIndex ? "border-primary ring-1 ring-primary/30" : "border-muted hover:border-muted-foreground/40"
                      }`}
                    >
                      <Image
                        src={img.url || "/placeholder.svg"}
                        alt={`View ${i + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom / Right — Info */}
            <div className="flex flex-col p-4 sm:p-5 sm:overflow-y-auto">
              {/* Name */}
              <h2 className="text-base font-bold text-foreground leading-snug mb-1.5">
                {product.name}
              </h2>

              {/* Price */}
              <div className="mb-3">
                {salePrice ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-secondary">${salePrice}</span>
                    <span className="text-sm text-muted-foreground line-through">${regularPrice}</span>
                    {discount && (
                      <span className="text-xs font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded">−{discount}%</span>
                    )}
                  </div>
                ) : (
                  <span className="text-xl font-bold text-foreground">${regularPrice}</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div
                  className="text-xs text-muted-foreground mb-3 leading-relaxed
                    [&_p]:mb-1.5 [&_p:last-child]:mb-0
                    [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-1.5
                    [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-1.5
                    [&_li]:mb-0.5
                    [&_strong]:font-semibold [&_em]:italic [&_u]:underline
                    [&_h1]:text-sm [&_h1]:font-bold [&_h1]:mb-1
                    [&_h2]:text-xs [&_h2]:font-bold [&_h2]:mb-1
                    [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:mb-1
                    [&_table]:w-full [&_table]:border-collapse [&_table]:mb-2 [&_table]:text-xs
                    [&_td]:border [&_td]:border-gray-200 [&_td]:p-1
                    [&_th]:border [&_th]:border-gray-200 [&_th]:p-1 [&_th]:bg-gray-50 [&_th]:font-semibold
                    [&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-2 [&_blockquote]:text-gray-500"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}

              {/* Stock */}
              <div className="flex items-center gap-1.5 mb-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${product.stock_quantity > 0 ? "bg-green-500" : "bg-orange-400"}`} />
                <span className="text-xs text-muted-foreground">
                  {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                </span>
              </div>

              <div className="flex-1" />

              {/* Quantity */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-medium text-muted-foreground">Qty:</span>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-2.5 py-1 text-sm hover:bg-muted transition-colors"
                  >
                    −
                  </button>
                  <span className="px-3 py-1 text-sm border-x min-w-[2rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-2.5 py-1 text-sm hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className="w-full mb-2"
                size="md"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {isAddingToCart ? "Adding..." : "Add to Cart"}
              </Button>

              {/* View full details */}
              <Link
                href={`/products/${product.id}`}
                onClick={onClose}
                className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                View Full Details <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
