"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/hooks/use-auth";
import { useCart } from "@/shared/hooks/use-cart";
import { apiClient } from "@/lib/api";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import Label from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Separator } from "@/shared/components/ui/separator";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { useToast } from "@/shared/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, CreditCard, Truck } from "lucide-react";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in or cart is empty
  if (!user) {
    router.push("/login?redirect=/checkout");
    return null;
  }

  if (!cart || cart.items.length === 0) {
    router.push("/cart");
    return null;
  }

  const subtotal = cart.total_price;
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!shippingAddress.trim()) {
      setError("Please enter a shipping address");
      return;
    }

    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        cart_items: cart.items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      };

      const order = await apiClient.createOrder(orderData);
      await clearCart();

      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id} has been placed.`,
      });

      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Checkout</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shipping-address">Shipping Address *</Label>
                    <Textarea
                      id="shipping-address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter your full shipping address"
                      required
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="payment-method">Payment Method *</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="apple_pay">Apple Pay</SelectItem>
                        <SelectItem value="google_pay">Google Pay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading
                  ? "Placing Order..."
                  : `Place Order - $${total.toFixed(2)}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
