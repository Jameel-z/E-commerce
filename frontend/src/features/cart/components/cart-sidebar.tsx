"use client";

import { useEffect } from "react";
import { useCart } from "@/shared/hooks/use-cart";
import { CartItem } from "@/features/cart/components";
import { CheckoutButton } from "@/features/cart/components/checkout-button";
import { CartItemOperations } from "@/features/cart/types/cart.types";
import { Button } from "@/shared/components/ui/button";
import { X, ShoppingCart, Trash2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/shared/hooks/use-auth";
import {
  generateWhatsAppOrderMessage,
  openWhatsApp,
} from "@/shared/utils/whatsapp";
import { siWhatsapp } from "simple-icons/icons";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, loading, clearCart, itemCount, updateQuantity, removeItem } =
    useCart();
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Close sidebar on escape key and prevent body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

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
    if (!cart || cart.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    onClose();
    router.push("/checkout");
  };

  // Create cart operations object
  const cartItemOperations: CartItemOperations = {
    onUpdateQuantity: async (productId: number, quantity: number) => {
      try {
        await updateQuantity(productId, quantity);
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
          title: "Item Removed",
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

  return (
    <>
      {/* Backdrop - mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-64 bg-card
          shadow-2xl z-50 transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b bg-muted">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <div>
              <h2 className="text-sm font-bold text-card-foreground leading-tight">
                Shopping Cart
              </h2>
              {itemCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="h-7 w-7 flex items-center justify-center rounded-md border border-muted-foreground/40 hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your cart...</p>
              </div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="text-sm font-medium text-card-foreground mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Add some products to get started
                </p>
                <Button onClick={onClose} size="sm" className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items - Scrollable */}
              <div className="overflow-y-auto max-h-[55vh] px-3 py-2 space-y-0">
                {cart.items.map((item) => (
                  <div key={item.id} className="px-1">
                    <CartItem item={item} operations={cartItemOperations} />
                  </div>
                ))}
              </div>

              {/* Fixed Footer */}
              <div className="border-t bg-muted px-3 py-2.5 space-y-2">
                {/* Clear Cart */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  className="w-full text-destructive border-destructive hover:bg-destructive/10 h-7 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1.5" />
                  Clear Cart
                </Button>

                {/* Total */}
                <div className="flex justify-between items-center text-sm font-semibold text-card-foreground px-0.5">
                  <span>Total</span>
                  <span>${isNaN(cart.total_price) ? "0.00" : cart.total_price.toFixed(2)}</span>
                </div>

                {/* Checkout */}
                {user ? (
                  <Button onClick={handleCheckout} className="w-full" size="sm">
                    <ShoppingCart className="mr-2 h-3.5 w-3.5" />
                    Proceed to Checkout
                  </Button>
                ) : (
                  <div className="space-y-1">
                    <Button
                      onClick={() => { onClose(); router.push("/login"); }}
                      className="w-full"
                      size="sm"
                    >
                      Login to Checkout
                    </Button>
                    <p className="text-[10px] text-center text-muted-foreground">
                      You need to login to place an order
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
