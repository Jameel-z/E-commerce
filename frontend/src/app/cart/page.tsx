"use client";

import { useCart } from "@/shared/hooks/use-cart";
import { CartItemComponent } from "@/features/cart/components/cart-item";
import { CartSummary } from "@/features/cart/components/cart-summary";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { useToast } from "@/shared/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";

export default function CartPage() {
  const { cart, loading, clearCart } = useCart();
  const { toast } = useToast();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Shopping Cart</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!cart || cart.items.length === 0 ? (
          <div className="text-center py-12">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">
                  Your cart is empty
                </h2>
                <p className="text-muted-foreground mb-6">
                  Looks like you haven't added any items to your cart yet
                </p>
                <Button asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Cart ({cart.items.length}{" "}
                  {cart.items.length === 1 ? "item" : "items"})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearCart}
                  className="text-destructive hover:text-destructive bg-transparent"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>

              <div className="space-y-3">
                {cart.items.map((item) => (
                  <CartItemComponent key={item.product_id} item={item} />
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="lg:col-span-1">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
