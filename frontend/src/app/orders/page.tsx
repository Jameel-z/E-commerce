"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/shared/hooks/use-auth";
import { useRouter } from "next/navigation";
import { apiClient, type Order } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  ChevronDown,
  MapPin,
  CreditCard,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const STATUS_BG: Record<string, string> = {
  pending:    "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200",
  processing: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200",
  shipped:    "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-200",
  delivered:  "bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200",
  cancelled:  "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200",
};

const STEPS = [
  { key: "pending",    label: "Placed",     icon: Clock },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped",    label: "Shipped",    icon: Truck },
  { key: "delivered",  label: "Delivered",  icon: CheckCircle2 },
];

function OrderRow({ order, open, onToggle }: { order: Order; open: boolean; onToggle: () => void }) {
  const isCancelled = order.status === "cancelled";
  const currentStep = isCancelled ? -1 : STEPS.findIndex((s) => s.key === order.status);

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      {/* Always-visible header — click to toggle */}
      <button
        onClick={onToggle}
        className="w-full text-left hover:bg-muted/40 transition-colors"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                Order {order.order_code}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(order.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                {" · "}
                {order.order_items?.length ?? 0} item{order.order_items?.length !== 1 ? "s" : ""}
                {" · "}
                <span className="font-medium">${Number(order.total_amount).toFixed(2)}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${
                  STATUS_BG[order.status] ?? "bg-muted text-muted-foreground"
                }`}
              >
                {order.status}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </CardHeader>
      </button>

      {/* Expandable details */}
      {open && (
        <CardContent className="border-t pt-4 space-y-4">
          {/* Status timeline */}
          {isCancelled ? (
            <div className="flex items-center gap-2 text-destructive text-sm font-medium">
              <XCircle className="h-4 w-4 shrink-0" />
              This order has been cancelled.
            </div>
          ) : (
            <div className="flex items-center">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = i <= currentStep;
                const current = i === currentStep;
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                          done
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-muted border-muted-foreground/30 text-muted-foreground"
                        } ${current ? "ring-2 ring-primary/30 ring-offset-1" : ""}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={`text-[10px] font-medium whitespace-nowrap ${done ? "text-primary" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1.5 mb-4 transition-colors ${
                          i < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Items */}
          <div className="divide-y border rounded-md text-sm">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-3 py-2.5">
                <div className="w-10 h-10 rounded bg-muted shrink-0 overflow-hidden">
                  {item.product_image_url ? (
                    <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <span className="flex-1 truncate text-xs">{item.product_name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {item.quantity} × ${Number(item.price_at_order).toFixed(2)}
                </span>
                <span className="text-xs font-medium shrink-0">
                  ${Number(item.total_price).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="flex justify-between px-3 py-2.5 bg-muted/40 font-semibold text-sm">
              <span>Total</span>
              <span>${Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery & payment info */}
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {(order.shipping_address || order.shipping_city) && (
              <div className="flex gap-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground leading-snug">
                  {[order.shipping_address, order.shipping_area, order.shipping_city].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
            {order.payment_method && (
              <div className="flex gap-2">
                <CreditCard className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <span className="text-muted-foreground capitalize">{order.payment_method}</span>
              </div>
            )}
          </div>

          {order.notes && (
            <p className="text-xs text-muted-foreground border-t pt-3">
              <span className="font-medium">Note: </span>{order.notes}
            </p>
          )}

        </CardContent>
      )}
    </Card>
  );
}

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      apiClient
        .getOrders()
        .then((data) => {
          setOrders(data);
          // Open the most recent order by default
          if (data.length > 0) setExpandedId(data[0].id);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  if (!user) return null;

  function toggle(id: number) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">My Orders</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet
              </p>
              <Button asChild>
                <Link href="/products">Start Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <h2 className="text-2xl font-bold mb-6">
              Order History ({orders.length})
            </h2>
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                open={expandedId === order.id}
                onToggle={() => toggle(order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
