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
              <h1 className="text-xl font-bold">Order {order.order_code}</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Order Details</CardTitle>
                  <Badge variant={getStatusColor(order.status)} className="capitalize text-sm px-3 py-1">
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
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
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-colors ${
                                isDone
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "bg-muted border-muted-foreground/30 text-muted-foreground"
                              } ${isCurrent ? "ring-2 ring-primary/30 ring-offset-1" : ""}`}
                            >
                              <Icon className="h-5 w-5" />
                            </div>
                            <span
                              className={`text-[11px] font-medium whitespace-nowrap ${
                                isDone ? "text-primary" : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                          {index < STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
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
                <div className="space-y-3">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                        <img
                          src={
                            item.product_image_url
                              ? item.product_image_url
                              : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'
                          }
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.dataset.fallback) {
                              target.dataset.fallback = "true";
                              target.src =
                                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23ddd" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                            }
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.product_name}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          ${Number(item.price_at_order).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base">
                          ${Number(item.total_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${(Number(order.total_amount) * 0.85).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${(Number(order.total_amount) * 0.07).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>${(Number(order.total_amount) * 0.08).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg pt-1">
                    <span>Total</span>
                    <span>${Number(order.total_amount).toFixed(2)}</span>
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
