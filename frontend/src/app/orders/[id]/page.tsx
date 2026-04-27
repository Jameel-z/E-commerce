"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/shared/hooks/use-auth";
import { apiClient, type Order } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  MapPin,
  MessageCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    const orderId = Number.parseInt(params.id as string);
    if (isNaN(orderId)) {
      router.push("/orders");
      return;
    }

    if (user) {
      apiClient
        .getOrder(orderId)
        .then(setOrder)
        .catch((error) => {
          console.error("Failed to load order:", error);
          router.push("/orders");
        })
        .finally(() => setLoading(false));
    }
  }, [params.id, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading order...</div>
      </div>
    );
  }

  if (!user || !order) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "default";
      case "processing":
        return "secondary";
      case "shipped":
        return "outline";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const STEPS = [
    { key: "pending", label: "Order Placed", icon: Clock },
    { key: "processing", label: "Processing", icon: Package },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
  ];

  const isCancelled = order?.status?.toLowerCase() === "cancelled";
  const currentStepIndex = isCancelled
    ? -1
    : STEPS.findIndex((s) => s.key === order?.status?.toLowerCase());

  const generateWhatsAppMessage = () => {
    if (!order) return "";

    let message = `🛒 *Order #${order.id}*\n\n`;

    if (order.customer_name) {
      message += `👤 *Customer Details:*\n`;
      message += `Name: ${order.customer_name}\n`;
      if (order.customer_phone) message += `Phone: ${order.customer_phone}\n`;
      message += `\n`;
    }

    if (order.shipping_address) {
      message += `📍 *Delivery Address:*\n`;
      message += `${order.shipping_address}\n`;
      if (order.shipping_area) message += `Area: ${order.shipping_area}\n`;
      if (order.shipping_city) message += `City: ${order.shipping_city}\n`;
      message += `\n`;
    }

    if (order.payment_method) {
      message += `💳 *Payment Method:* ${order.payment_method.toUpperCase()}\n\n`;
    }

    message += `📦 *Items:*\n`;
    order.order_items?.forEach((item, index) => {
      message += `${index + 1}. ${item.product_name}\n`;
      message += `   Qty: ${item.quantity} × $${Number(
        item.price_at_order
      ).toFixed(2)}\n`;
    });

    message += `\n💰 *Total: $${Number(order.total_amount).toFixed(2)}*\n`;

    if (order.notes) {
      message += `\n📝 *Notes:* ${order.notes}`;
    }

    return message;
  };

  const handleShareWhatsApp = () => {
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/orders">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Order #{order.id}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Details</CardTitle>
                  <Badge variant={getStatusColor(order.status)} className="capitalize">
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </CardHeader>

              {/* Order Status Timeline */}
              <div className="px-6 pb-4">
                {isCancelled ? (
                  <div className="flex items-center gap-2 text-destructive text-sm font-medium py-2">
                    <XCircle className="h-5 w-5" />
                    This order has been cancelled.
                  </div>
                ) : (
                  <div className="flex items-center">
                    {STEPS.map((step, index) => {
                      const Icon = step.icon;
                      const isDone = index <= currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      return (
                        <div key={step.key} className="flex items-center flex-1 last:flex-none">
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isDone
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "bg-muted border-muted-foreground/30 text-muted-foreground"
                              } ${isCurrent ? "ring-2 ring-primary/30 ring-offset-1" : ""}`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span
                              className={`text-[10px] font-medium whitespace-nowrap ${
                                isDone ? "text-primary" : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                          {index < STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 mx-1 mb-4 transition-colors ${
                                index < currentStepIndex ? "bg-primary" : "bg-muted-foreground/20"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                        <img
                          src={
                            item.product_image_url
                              ? item.product_image_url
                              : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'
                          }
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.dataset.fallback) {
                              target.dataset.fallback = "true";
                              target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${Number(item.price_at_order).toFixed(2)} ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${Number(item.total_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Info */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      ${(Number(order.total_amount) * 0.85).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      ${(Number(order.total_amount) * 0.07).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>
                      ${(Number(order.total_amount) * 0.08).toFixed(2)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${Number(order.total_amount).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* WhatsApp Share Button */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Share Order</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleShareWhatsApp}
                  variant="outline"
                  className="w-full"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Share via WhatsApp
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Share your order details with someone
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
