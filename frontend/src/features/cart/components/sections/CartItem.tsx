"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
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
    <div className="py-2 border-b border-border last:border-b-0">
      <div className="flex items-start gap-2">
        {/* Image */}
        <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
          <div className="relative w-9 h-9 rounded border overflow-hidden bg-gray-100">
            <Image src={imageUrl} alt={item.product.name} fill className="object-cover" />
          </div>
        </Link>

        {/* Name + Price */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.product.id}`}>
            <p className="text-xs font-medium text-foreground hover:text-primary truncate leading-tight">
              {item.product.name}
            </p>
          </Link>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            ${productPrice.toFixed(2)} × {quantity} = <span className="font-semibold text-foreground">${(productPrice * quantity).toFixed(2)}</span>
          </p>
        </div>

        {/* Qty controls + Remove stacked */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="flex items-center border rounded overflow-hidden">
            <button
              onClick={() => updateQuantity(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="px-1 py-0.5 hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <Minus className="h-2.5 w-2.5" />
            </button>
            <span className="px-1.5 py-0.5 text-xs border-x min-w-[1.25rem] text-center">{quantity}</span>
            <button
              onClick={() => updateQuantity(quantity + 1)}
              disabled={isUpdating}
              className="px-1 py-0.5 hover:bg-muted disabled:opacity-40 transition-colors"
            >
              <Plus className="h-2.5 w-2.5" />
            </button>
          </div>
          <button
            onClick={removeItem}
            disabled={isUpdating}
            className="text-destructive hover:text-destructive/80 transition-colors disabled:opacity-40"
            title="Remove"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
