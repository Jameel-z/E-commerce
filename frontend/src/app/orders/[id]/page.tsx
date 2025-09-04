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
import { ArrowLeft, Package, Truck, CreditCard, MapPin } from "lucide-react";

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
                  <Badge variant={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={`/placeholder.svg?height=64&width=64&query=${encodeURIComponent(
                            item.product_name
                          )}`}
                          alt={item.product_name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.product_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          ${item.price_at_order.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${item.total_price.toFixed(2)}
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
                    <span>${(order.total_amount * 0.85).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${(order.total_amount * 0.07).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(order.total_amount * 0.08).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${order.total_amount.toFixed(2)}</span>
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
