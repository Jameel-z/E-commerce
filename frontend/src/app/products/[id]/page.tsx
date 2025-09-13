"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ProductDetailLoading,
  ProductNotFound,
  ProductDetailError,
  ProductDetailHeader,
  ProductDetailContent,
} from "@/features/products/components";
import { useCart } from "@/shared/hooks/use-cart";
import { useToast } from "@/shared/hooks/use-toast";
import { apiClient, type ProductDetail } from "@/lib/api";

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productId = Number.parseInt(params.id as string);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await apiClient.getProduct(productId);
        setProduct(productData);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        setError("Product not found or unable to load product details.");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast({
        title: "Added to Cart",
        description: `${quantity} ${product.name} added to your cart.`,
      });
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

  if (loading) {
    return <ProductDetailLoading />;
  }

  if (!product) {
    return <ProductNotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <ProductDetailHeader />

      {error ? (
        <ProductDetailError
          error={error}
          onRetry={() => window.location.reload()}
        />
      ) : (
        <ProductDetailContent
          product={product}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
          isAddingToCart={isAddingToCart}
        />
      )}
    </div>
  );
}
