"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { useCart } from "@/shared/hooks/use-cart";
import { useAuth } from "@/shared/hooks/use-auth";
import Link from "next/link";
import { ShoppingCart, CreditCard } from "lucide-react";

export function CartSummary() {
  const { cart } = useCart();
  const { user } = useAuth();

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const subtotal = cart.total_price;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal ({cart.items.length} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {shipping > 0 && (
          <p className="text-sm text-muted-foreground">
            Add ${(50 - subtotal).toFixed(2)} more for free shipping
          </p>
        )}

        <div className="space-y-2">
          {user ? (
            <Button className="w-full" size="lg" asChild>
              <Link href="/checkout">
                <CreditCard className="h-4 w-4 mr-2" />
                Proceed to Checkout
              </Link>
            </Button>
          ) : (
            <>
              <Button className="w-full" size="lg" asChild>
                <Link href="/login?redirect=/checkout">
                  Sign In to Checkout
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Or continue as guest at checkout
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
