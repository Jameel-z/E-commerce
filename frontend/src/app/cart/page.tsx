"use client";

import { useCart } from "@/shared/hooks/use-cart";
import { useToast } from "@/shared/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  CartEmptyState,
  CartLoading,
  CartItem,
  CartSummary,
} from "@/features/cart/components";
import {
  CartItemOperations,
  CartSummaryData,
} from "@/features/cart/types/cart.types";
import { UnifiedLayout } from "@/shared/components";
import { Button } from "@/shared/components";
import { Trash2 } from "lucide-react";

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  // Create operations object for cart items
  const cartItemOperations: CartItemOperations = {
    onUpdateQuantity: async (productId: number, quantity: number) => {
      try {
        await updateQuantity(productId, quantity);
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
        throw error;
      }
    },
    onRemoveItem: async (productId: number) => {
      try {
        await removeItem(productId);
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
        throw error;
      }
    },
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "Success",
        description: "Cart cleared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  // Calculate cart summary data
  const cartSummaryData: CartSummaryData = {
    subtotal: cart?.total_price || 0,
    shipping: cart && cart.total_price > 50 ? 0 : 9.99,
    tax: (cart?.total_price || 0) * 0.08,
    total:
      (cart?.total_price || 0) +
      (cart && cart.total_price > 50 ? 0 : 9.99) +
      (cart?.total_price || 0) * 0.08,
    itemCount: cart?.items.length || 0,
  };

  if (loading) {
    return <CartLoading />;
  }

  if (!cart || cart.items.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: {
          label: "Continue Shopping",
          href: "/products",
        },
        title: `Shopping Cart (${cart.items.length} ${
          cart.items.length === 1 ? "item" : "items"
        })`,
        actions:
          cart.items.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCart}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          ) : undefined,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-3">
              {cart.items.map((item) => (
                <CartItem
                  key={item.product_id}
                  item={item}
                  operations={cartItemOperations}
                />
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              data={cartSummaryData}
              itemCount={cart.items.length}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </UnifiedLayout>
  );
}
