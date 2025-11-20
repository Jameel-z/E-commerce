"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui";
import { ProductDetailContent } from "@/features/products/components";
import { apiClient, type ProductDetail } from "@/lib/api";
import { useCart } from "@/shared/hooks/use-cart";
import { useToast } from "@/shared/hooks/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/ui";

interface QuickViewModalProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickViewModal({
  productId,
  isOpen,
  onClose,
}: QuickViewModalProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const fetchProduct = async () => {
    if (!productId) return;

    setLoading(true);
    setError(false);
    console.log("QuickView: Fetching product", productId);

    try {
      const productData = await apiClient.getProduct(productId);
      console.log("QuickView: Product loaded", productData);
      setProduct(productData);
      setError(false);
    } catch (error) {
      console.error("QuickView: Failed to fetch product:", error);
      setProduct(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && productId) {
      fetchProduct();
    }

    // Reset when modal closes
    if (!isOpen) {
      setQuantity(1);
      setProduct(null);
      setLoading(false);
      setError(false);
    }
  }, [isOpen, productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast({
        title: "Added to Cart",
        description: `${quantity} ${product.name} added to your cart.`,
      });
      onClose(); // Close modal after adding to cart
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {product?.name || "Product Details"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertCircle className="h-16 w-16 text-destructive mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Unable to load product
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              There was an error loading the product details. This might be due
              to a network issue or the product may not exist.
            </p>
            <div className="flex gap-3">
              <Button onClick={fetchProduct} variant="default">
                Try Again
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        ) : product ? (
          <ProductDetailContent
            product={product}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onAddToCart={handleAddToCart}
            isAddingToCart={isAddingToCart}
            className="p-0 max-w-none"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
