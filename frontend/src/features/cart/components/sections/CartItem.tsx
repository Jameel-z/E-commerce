import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Input from "@/shared/components/ui/input";
import { getProductImageUrl } from "@/shared/utils/image";
import {
  CartItem as CartItemType,
  CartItemOperations,
} from "@/features/cart/types/cart.types";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

interface CartItemProps {
  item: CartItemType;
  operations: CartItemOperations;
}

export function CartItem({ item, operations }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity === item.quantity) return;

    setIsUpdating(true);
    try {
      await operations.onUpdateQuantity(item.product_id, newQuantity);
      setQuantity(newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
      setQuantity(item.quantity); // Reset on error
    } finally {
      setIsUpdating(false);
    }
  };

  const removeItem = async () => {
    setIsUpdating(true);
    try {
      await operations.onRemoveItem(item.product_id);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuantityInputChange = (value: string) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const handleQuantityInputBlur = () => {
    updateQuantity(quantity);
  };

  const handleQuantityInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      updateQuantity(quantity);
    }
  };

  // Convert string price to number and get proper image URL
  const productPrice = Number(item.product.price);
  const imageUrl = getProductImageUrl(item.product);

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex gap-4">
        {/* Product Image */}
        <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
          <div className="relative w-20 h-20 rounded overflow-hidden border border-border">
            <Image
              src={imageUrl}
              alt={item.product.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-200"
            />
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.product.id}`} className="group">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {item.product.name}
            </h3>
          </Link>

          {item.product.category && (
            <p className="text-sm text-muted-foreground mt-1">
              {item.product.category.name}
            </p>
          )}

          <div className="mt-2">
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(productPrice)}
            </p>
            {item.quantity > 1 && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(productPrice * item.quantity)} total
              </p>
            )}
          </div>
        </div>

        {/* Quantity and Actions */}
        <div className="flex flex-col items-end gap-3">
          {/* Quantity Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleQuantityInputChange(e.target.value)
              }
              onBlur={handleQuantityInputBlur}
              onKeyDown={handleQuantityInputKeyDown}
              disabled={isUpdating}
              className="w-16 h-8 text-center"
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={isUpdating}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={removeItem}
            disabled={isUpdating}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
