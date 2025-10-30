"use client";

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
      setQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleQuantityInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= 99) {
      updateQuantity(value);
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

  const productPrice = Number(item.product.price);
  const imageUrl = getProductImageUrl(item.product);

  return (
    <div className="py-3 border-b border-border last:border-b-0">
      {/* Top Row: Product Name */}
      <div className="mb-2">
        <Link href={`/products/${item.product.id}`}>
          <h3 className="font-medium text-sm text-foreground hover:text-primary truncate">
            {item.product.name}
          </h3>
        </Link>
      </div>

      {/* Bottom Row: Image, Price, and Controls */}
      <div className="flex items-center gap-3">
        {/* Product Image */}
        <Link href={`/products/${item.product.id}`}>
          <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border">
            <Image
              src={imageUrl}
              alt={item.product.name}
              fill
              className="object-cover hover:scale-105 transition-transform"
            />
          </div>
        </Link>

        {/* Unit Price */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            ${productPrice.toFixed(2)} each
          </p>
          <p className="text-sm font-semibold text-foreground">
            ${(productPrice * quantity).toFixed(2)} total
          </p>
        </div>

        {/* Right Side: Quantity Controls & Remove */}
        <div className="flex flex-col gap-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 hover:bg-accent"
              onClick={() => updateQuantity(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Input
              type="number"
              value={quantity}
              onChange={handleQuantityInputChange}
              className="w-12 h-7 text-center text-xs font-medium"
              min="1"
              max="99"
              disabled={isUpdating}
            />

            <Button
              size="sm"
              variant="outline"
              className="h-7 w-7 p-0 hover:bg-accent"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={isUpdating}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={removeItem}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive h-7 px-2 text-xs"
            disabled={isUpdating}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
