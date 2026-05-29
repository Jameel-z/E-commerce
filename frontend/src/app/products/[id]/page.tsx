"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ProductDetailLoading,
  ProductNotFound,
  ProductDetailError,
  ProductDetailContent,
} from "@/features/products/components";
import { useCart } from "@/shared/hooks/use-cart";
import { useToast } from "@/shared/hooks/use-toast";
import { apiClient, type ProductDetail } from "@/lib/api";
import { UnifiedLayout } from "@/shared/components";
import { useRecentlyViewed } from "@/shared/hooks/use-recently-viewed";
import { RecentlyViewedStrip } from "@/shared/components/products/RecentlyViewedStrip";
import { RelatedProducts } from "@/shared/components/products/RelatedProducts";
import { getProductSchema, getBreadcrumbSchema } from "@/shared/utils/schema";

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { trackView } = useRecentlyViewed();
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
        // Track as recently viewed — convert ProductDetail → Product shape
        trackView({
          id: productData.id,
          name: productData.name,
          price: Number(productData.price),
          primary_image_url: productData.primary_image_url,
          category_name: productData.category?.name ?? "",
          stock_quantity: productData.stock_quantity,
          description: productData.description,
          regular_price: productData.regular_price ? Number(productData.regular_price) : null,
          sale_price: productData.sale_price ? Number(productData.sale_price) : null,
          is_on_sale: productData.is_on_sale,
          discount_percentage: productData.discount_percentage,
          created_at: productData.created_at,
        });
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://961shop.com";
  const breadcrumbItems = [
    { name: "Home", url: siteUrl },
    { name: "Products", url: `${siteUrl}/products` },
    ...(product.category ? [{ name: product.category.name, url: `${siteUrl}/products?category=${product.category_id}` }] : []),
    { name: product.name, url: `${siteUrl}/products/${product.id}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getProductSchema(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getBreadcrumbSchema(breadcrumbItems)) }}
      />
      <UnifiedLayout
        pageHeaderProps={{
          backButton: {
            label: "Back to Products",
            href: "/products",
          },
          title: product?.name,
        }}
      >
        {error ? (
          <ProductDetailError
            error={error}
            onRetry={() => window.location.reload()}
          />
        ) : (
          <>
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
                  excludeId={productId}
                  categoryName={product.category?.name}
                />
              )}
              <RecentlyViewedStrip excludeId={productId} />
            </div>
          </>
        )}
      </UnifiedLayout>
    </>
  );
}
