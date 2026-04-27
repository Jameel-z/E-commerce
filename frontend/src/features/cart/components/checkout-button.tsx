"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { apiClient } from "@/lib/api";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";

interface CheckoutButtonProps {
  cartId: number;
  itemCount: number;
  totalPrice: number;
  disabled?: boolean;
  orderMethod?: "online" | "whatsapp";
  paymentMethod?: string;
  onOrderCreated?: () => void;
}

export function CheckoutButton({
  cartId,
  itemCount,
  totalPrice,
  disabled = false,
  orderMethod = "online",
  paymentMethod,
  onOrderCreated,
}: CheckoutButtonProps) {
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (itemCount === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checking out",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreatingOrder(true);

      // Create order from cart
      const order = await apiClient.createOrder(
        cartId,
        undefined,
        orderMethod,
        paymentMethod
      );

      const methodLabel =
        orderMethod === "whatsapp" ? "WhatsApp order" : "Order";

      toast({
        title: `${methodLabel} placed successfully!`,
        description: `Order #${
          order.id
        } has been created. Total: $${totalPrice.toFixed(2)}`,
      });

      // Call callback if provided (for closing sidebar, etc.)
      if (onOrderCreated) {
        onOrderCreated();
      }

      // Redirect to orders page
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || itemCount === 0 || isCreatingOrder}
      className="w-full"
      size="lg"
    >
      {isCreatingOrder ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Order...
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Checkout ({itemCount} {itemCount === 1 ? "item" : "items"})
        </>
      )}
    </Button>
  );
}
