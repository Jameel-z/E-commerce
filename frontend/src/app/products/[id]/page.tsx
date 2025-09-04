"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import Input from "@/shared/components/ui/input";
import Label from "@/shared/components/ui/label";
import { useCart } from "@/shared/hooks/use-cart";
import { useToast } from "@/shared/hooks/use-toast";
import {
  apiClient,
  type ProductDetail,
  getProductImageUrl,
  getImageUrl,
} from "@/lib/api";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingCart, Package, Minus, Plus } from "lucide-react";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
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

  const incrementQuantity = () => {
    if (product && quantity < product.stock_quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted animate-pulse rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
              <div className="h-6 bg-muted animate-pulse rounded w-1/2"></div>
              <div className="h-32 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-4">
            The product you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Link>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="text-center py-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <Package className="h-16 w-16 mx-auto text-red-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2 text-red-800">
                  Product Not Found
                </h2>
                <p className="text-red-600 mb-6">{error}</p>
                <div className="space-y-3">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/products">Browse All Products</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : product ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                <Image
                  src={getProductImageUrl(product)}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.stock_quantity === 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute top-4 right-4"
                  >
                    Out of Stock
                  </Badge>
                )}
                {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                  <Badge variant="secondary" className="absolute top-4 right-4">
                    Low Stock
                  </Badge>
                )}
              </div>

              {/* Secondary Images */}
              {product.secondary_images &&
                product.secondary_images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.secondary_images.map((image) => (
                      <div
                        key={image.id}
                        className="aspect-square relative overflow-hidden rounded-md bg-muted"
                      >
                        <Image
                          src={getImageUrl(image.url) || "/placeholder.svg"}
                          alt={`${product.name} - Image ${image.id}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <p className="text-2xl font-bold text-secondary">
                  ${product.price.toFixed(2)}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Stock:</span>
                <Badge
                  variant={
                    product.stock_quantity > 10
                      ? "default"
                      : product.stock_quantity > 0
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {product.stock_quantity > 0
                    ? `${product.stock_quantity} available`
                    : "Out of stock"}
                </Badge>
              </div>

              {product.stock_quantity > 0 && (
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="quantity" className="text-sm font-medium">
                        Quantity
                      </Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={decrementQuantity}
                          disabled={quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max={product.stock_quantity}
                          value={quantity}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value);
                            if (value >= 1 && value <= product.stock_quantity) {
                              setQuantity(value);
                            }
                          }}
                          className="w-20 text-center"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={incrementQuantity}
                          disabled={quantity >= product.stock_quantity}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className="w-full"
                      size="lg"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {product.stock_quantity === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      This product is currently out of stock.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/products">Browse Other Products</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
