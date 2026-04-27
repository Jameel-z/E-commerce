"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/hooks/use-auth";
import { useCart } from "@/shared/hooks/use-cart";
import { apiClient } from "@/lib/api";
import { Button } from "@/shared/components/ui/button";
import Input from "@/shared/components/ui/input";
import Label from "@/shared/components/ui/label";
import Textarea from "@/shared/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ArrowLeft, Loader2, ShoppingCart } from "lucide-react";
import { useToast } from "@/shared/hooks/use-toast";
import Link from "next/link";
import { siWhatsapp } from "simple-icons/icons";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading, itemCount, refreshCart } = useCart();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingArea: "",
    paymentMethod: "cash", // Always cash on delivery
    notes: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!cartLoading && itemCount === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checkout",
        variant: "destructive",
      });
      router.push("/");
    }
  }, [itemCount, cartLoading, router]); // toast is stable via useCallback, excluded to prevent loop

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || !user) return;

    // Validate required fields
    if (!formData.customerName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your full name",
        variant: "destructive",
      });
      return;
    }

    if (!formData.customerPhone.trim()) {
      toast({
        title: "Phone required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (!formData.shippingAddress.trim()) {
      toast({
        title: "Address required",
        description: "Please enter your delivery address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create order with shipping details
      const order = await apiClient.createOrder(
        cart.id,
        formData.notes,
        "online",
        formData.paymentMethod,
        formData.customerName,
        formData.customerPhone,
        formData.shippingAddress,
        formData.shippingCity,
        formData.shippingArea
      );

      toast({
        title: "Order placed successfully!",
        description: `Order #${order.id} has been created. You will be redirected to your order.`,
      });

      await refreshCart();
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description:
          error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateWhatsAppMessage = (orderId: number) => {
    if (!cart) return "";

    let message = `🛒 *New Order #${orderId}*\n\n`;
    message += `👤 *Customer Details:*\n`;
    message += `Name: ${formData.customerName}\n`;
    message += `Phone: ${formData.customerPhone}\n\n`;
    message += `📍 *Delivery Address:*\n`;
    message += `${formData.shippingAddress}\n`;
    if (formData.shippingArea) message += `Area: ${formData.shippingArea}\n`;
    if (formData.shippingCity) message += `City: ${formData.shippingCity}\n\n`;

    message += `💳 *Payment Method:* ${formData.paymentMethod.toUpperCase()}\n\n`;

    message += `📦 *Items:*\n`;
    cart.items.forEach((item, index) => {
      message += `${index + 1}. ${item.product.name}\n`;
      message += `   Qty: ${item.quantity} × $${Number(item.product.price).toFixed(
        2
      )}\n`;
    });

    message += `\n💰 *Total: $${cart.total_price.toFixed(2)}*\n`;

    if (formData.notes) {
      message += `\n📝 *Notes:* ${formData.notes}`;
    }

    return message;
  };

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !cart) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mt-4">Checkout</h1>
          <p className="text-muted-foreground">Complete your order details</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  {/* Customer Name */}
                  <div>
                    <Label htmlFor="customerName">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="customerPhone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="customerPhone"
                      name="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="shippingAddress">
                      Delivery Address{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      required
                      rows={3}
                    />
                  </div>

                  {/* City and Area */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shippingCity">City</Label>
                      <Input
                        id="shippingCity"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="shippingArea">Area/District</Label>
                      <Input
                        id="shippingArea"
                        name="shippingArea"
                        value={formData.shippingArea}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  {/* Payment Method - Fixed to Cash on Delivery */}
                  <div>
                    <Label>Payment Method</Label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center">
                      <span className="mr-2">💵</span>
                      <span className="font-medium">Cash on Delivery</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pay when you receive your order
                    </p>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Special instructions, preferred delivery time, etc."
                      rows={2}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Place Order
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} × {item.quantity}
                      </span>
                      <span>
                        ${(Number(item.product.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${cart.total_price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>✓ Stock will be reserved for your order</p>
                  <p>✓ You'll receive order confirmation via WhatsApp</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
