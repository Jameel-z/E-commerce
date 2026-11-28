"use client";

import { useState, useEffect } from "react";
import { ProductDetailContent } from "@/features/products/components";
import { useCart } from "@/shared/hooks/use-cart";
import { useToast } from "@/shared/hooks/use-toast";
import { type ProductDetail } from "@/lib/api";
import { UnifiedLayout } from "@/shared/components";
import { useRecentlyViewed } from "@/shared/hooks/use-recently-viewed";
import { RecentlyViewedStrip } from "@/shared/components/products/RecentlyViewedStrip";
import { RelatedProducts } from "@/shared/components/products/RelatedProducts";

// Interactive part of the product page. The product itself is loaded on the
// server (see page.tsx) so crawlers get the name, price and stock in the HTML.
export function ProductDetailClient({ product }: { product: ProductDetail }) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { trackView } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    // Track as recently viewed — convert ProductDetail → Product shape
    trackView({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      primary_image_url: product.primary_image_url,
      category_name: product.category?.name ?? "",
      stock_quantity: product.stock_quantity,
      description: product.description,
      regular_price: product.regular_price ? Number(product.regular_price) : null,
      sale_price: product.sale_price ? Number(product.sale_price) : null,
      is_on_sale: product.is_on_sale,
      discount_percentage: product.discount_percentage,
      created_at: product.created_at,
    });
    // Only re-track when the product changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const handleAddToCart = async () => {
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

  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: {
          label: "Back to Products",
          href: "/products",
        },
        title: product.name,
      }}
    >
      <ProductDetailContent
        product={product}
        quantity={quantity}
        onQuantityChange={setQuantity}
        onAddToCart={handleAddToCart}
        isAddingToCart={isAddingToCart}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t mt-4 pt-4 space-y-2">
        {product.category_id && (
          <RelatedProducts
            categoryId={product.category_id}
            excludeId={product.id}
            categoryName={product.category?.name}
          />
        )}
        <RecentlyViewedStrip excludeId={product.id} />
      </div>
    </UnifiedLayout>
  );
}
