import Link from "next/link";
import { Button, Card, CardContent } from "@/shared/components";
import { QuantitySelector } from "@/features/products/components";
import { type ProductDetail } from "@/lib/api";
import { ShoppingCart } from "lucide-react";

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
  if (product.stock_quantity === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 space-y-4">
          <QuantitySelector
            quantity={quantity}
            maxQuantity={100}
            onQuantityChange={onQuantityChange}
          />

          <Button
            onClick={onAddToCart}
            disabled={isAddingToCart}
            className="w-full h-14 text-base font-bold tracking-widest uppercase"
            size="lg"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            {isAddingToCart ? "Adding to Cart..." : "Add to Cart Anyway"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6 space-y-4">
        <QuantitySelector
          quantity={quantity}
          maxQuantity={100}
          onQuantityChange={onQuantityChange}
        />

        <Button
          onClick={onAddToCart}
          disabled={isAddingToCart}
          className="w-full h-14 text-base font-bold tracking-widest uppercase"
          size="lg"
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          {isAddingToCart ? "Adding to Cart..." : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}
