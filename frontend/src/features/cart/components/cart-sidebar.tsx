"use client";

import { useEffect } from "react";
import { useCart } from "@/shared/hooks/use-cart";
import { CartItem, CartEmptyState } from "@/features/cart/components";
import { CartItemOperations } from "@/features/cart/types/cart.types";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/hooks/use-toast";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, loading, clearCart, itemCount, updateQuantity, removeItem } =
    useCart();
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

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
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
      {/* Backdrop - only on mobile, no backdrop on desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:bg-transparent lg:pointer-events-none"
          onClick={onClose}
        />
      )}

      {/* Full Height Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-screen w-full sm:w-96 bg-white dark:bg-gray-900 
          shadow-2xl z-50 transform transition-transform duration-300 ease-out
          flex flex-col
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Shopping Cart
              </h2>
              {itemCount > 0 && (
                <p className="text-sm text-gray-500">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-500">Loading your cart...</p>
              </div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-6">
                  Add some products to get started
                </p>
                <Button onClick={onClose} className="w-full">
                  Continue Shopping
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                  >
                    <CartItem item={item} operations={cartItemOperations} />
                  </div>
                ))}
              </div>

              {/* Fixed Footer */}
              <div className="border-t bg-gray-50 dark:bg-gray-800 p-4 space-y-4">
                {/* Clear Cart */}
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>

                {/* Total */}
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-300">
                      Subtotal:
                    </span>
                    <span className="font-medium">
                      ${cart.total_price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">
                      ${cart.total_price.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  className="w-full h-12 text-lg font-medium"
                  size="lg"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
