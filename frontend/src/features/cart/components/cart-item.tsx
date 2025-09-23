"use client";

import { useState } from "react";
import type { CartItem } from "@/features/cart/types";
import { getProductImageUrl } from "@/shared/utils/image";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import Input from "@/shared/components/ui/input";
import { useCart } from "@/shared/hooks/use-cart";
import { useToast } from "@/shared/hooks/use-toast";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  item: CartItem;
}

export function CartItemComponent({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);
  const [updating, setUpdating] = useState(false);
  const { updateQuantity, removeItem } = useCart();
  const { toast } = useToast();

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdating(true);
    try {
      await updateQuantity(item.product_id, newQuantity);
      setQuantity(newQuantity);
      toast({
        title: "Success",
        description: "Cart updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setUpdating(true);
    try {
      await removeItem(item.product_id);
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={getProductImageUrl(item.product)}
              alt={item.product.name}
              fill
              className="object-cover rounded"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{item.product.name}</h3>
            <p className="text-sm text-muted-foreground">
              ${Number(item.product.price).toFixed(2)} each
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={updating || quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value);
                if (val >= 1) {
                  setQuantity(val);
                }
              }}
              onBlur={() => {
                if (quantity !== item.quantity) {
                  handleQuantityChange(quantity);
                }
              }}
              className="w-16 text-center"
              min={1}
              disabled={updating}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={updating}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-right">
            <p className="font-semibold">
              ${(Number(item.product.price) * Number(quantity)).toFixed(2)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={updating}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
