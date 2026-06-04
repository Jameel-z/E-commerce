"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import Input from "@/shared/components/ui/input";
import { apiClient, type Order } from "@/lib/api";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  MapPin,
  CreditCard,
  Package,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";

const PER_PAGE = 20;

// ─── helpers ────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled";

const STATUS_COLORS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  pending: "secondary",
  processing: "default",
  shipped: "outline",
  delivered: "default",
  cancelled: "destructive",
};

const STATUS_BG: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200",
  processing: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200",
  shipped: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-200",
  delivered: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200",
  cancelled: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200",
};

function statusLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── OrderCard ───────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: Order;
  onStatusUpdate: (id: number, status: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  updatingId: number | null;
}

function OrderCard({ order, onStatusUpdate, onDelete, updatingId }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isUpdating = updatingId === order.id;

  const nextActions: { label: string; status: string; variant: "default" | "outline" | "destructive" }[] = [];

  if (order.status === "pending") {
    nextActions.push({ label: "Mark Processing", status: "processing", variant: "default" });
    nextActions.push({ label: "Cancel", status: "cancelled", variant: "destructive" });
  } else if (order.status === "processing") {
    nextActions.push({ label: "Mark Shipped", status: "shipped", variant: "default" });
    nextActions.push({ label: "Cancel", status: "cancelled", variant: "destructive" });
  } else if (order.status === "shipped") {
    nextActions.push({ label: "Mark as Done", status: "delivered", variant: "default" });
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      setDeleting(true);
      try {
        await onDelete(order.id);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Clickable Header - Always Visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left hover:bg-muted/50 transition-colors"
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-base font-semibold">
                Order {order.order_code}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDate(order.created_at)}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  STATUS_BG[order.status] ?? "bg-muted text-muted-foreground"
                }`}
              >
                {statusLabel(order.status)}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>
        </CardHeader>
      </button>

      {/* Expandable Details */}
      {expanded && (
        <CardContent className="space-y-3 border-t pt-4">
          {/* Customer info */}
          <div className="rounded-md bg-muted/50 border px-3 py-2.5 space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="font-medium">
              {order.customer_name || <span className="text-muted-foreground italic">No name provided</span>}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className={order.customer_phone ? "" : "text-muted-foreground italic"}>
              {order.customer_phone || "No phone provided"}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
            {order.shipping_address || order.shipping_area || order.shipping_city ? (
              <span>
                {[order.shipping_address, order.shipping_area, order.shipping_city]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            ) : (
              <span className="text-muted-foreground italic">No location provided</span>
            )}
          </div>
          </div>

          {/* Order meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
              <span>
                {order.payment_method ?? "—"}{" "}
                <span className="text-xs">({order.order_method})</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 shrink-0" />
              <span>
                {order.order_items?.length ?? 0} item
                {order.order_items?.length !== 1 ? "s" : ""} · $
                {Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          {order.notes && (
            <p className="text-xs text-muted-foreground border-t pt-2">
              <span className="font-medium">Note: </span>
              {order.notes}
            </p>
          )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {nextActions.map((action) => (
                <Button
                  key={action.status}
                  size="sm"
                  variant={action.variant}
                  disabled={isUpdating || deleting}
                  onClick={() => onStatusUpdate(order.id, action.status)}
                >
                  {isUpdating ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : action.status === "delivered" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : action.status === "shipped" ? (
                    <Truck className="h-3.5 w-3.5" />
                  ) : action.status === "cancelled" ? (
                    <XCircle className="h-3.5 w-3.5" />
                  ) : null}
                  {action.label}
                </Button>
              ))}

              {order.status === "cancelled" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                >
                  {deleting ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </Button>
              )}
            </div>

            {/* Order Items */}
            {order.order_items && order.order_items.length > 0 && (
              <div className="border rounded-md divide-y text-sm pt-2">
                <p className="text-xs font-medium text-muted-foreground px-3 py-2">Items</p>
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-3 py-2 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.product_image_url && (
                        <img
                          src={item.product_image_url}
                          alt={item.product_name}
                          className="h-8 w-8 rounded object-cover shrink-0"
                        />
                      )}
                      <span className="truncate text-xs">{item.product_name}</span>
                    </div>
                    <div className="text-right shrink-0 text-xs text-muted-foreground">
                      <span>{item.quantity} × ${Number(item.price_at_order).toFixed(2)}</span>
                      <span className="ml-2 font-medium text-foreground">
                        = ${Number(item.total_price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const totalPages = Math.ceil(total / PER_PAGE);

  const fetchOrders = useCallback(async (p = page, query = searchQuery) => {
    setLoading(true);
    try {
      const data = await apiClient.getAllOrders(p, PER_PAGE, activeFilter === "all" ? undefined : activeFilter, query || undefined);
      setOrders(data.orders);
      setTotal(data.total);
    } catch {
      showToast("Failed to load orders", false);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, activeFilter]);

  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleStatusUpdate(orderId: number, newStatus: string) {
    setUpdatingId(orderId);
    try {
      const updated = await apiClient.updateOrderStatus(orderId, newStatus);
      const updatedOrder = orders.find(o => o.id === orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o))
      );
      showToast(`Order ${updatedOrder?.order_code} marked as ${newStatus}`, true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update order";
      showToast(msg, false);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(orderId: number) {
    try {
      const deletedOrder = orders.find(o => o.id === orderId);
      await apiClient.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setTotal((prev) => prev - 1);
      showToast(`Order ${deletedOrder?.order_code} deleted successfully`, true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete order";
      showToast(msg, false);
    }
  }

  const counts: Record<string, number> = { all: total };
  for (const o of orders) {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  }

  const filtered =
    activeFilter === "all" ? orders : orders.filter((o) => o.status === activeFilter);

  const handleFilterChange = (key: StatusFilter) => {
    setActiveFilter(key);
    setPage(1);
    setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AdminLayout title="Orders">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 rounded-lg border px-4 py-3 text-sm shadow-lg transition-all ${
            toast.ok
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Search bar */}
      <div className="mb-6">
        <Input
          placeholder="Search by order code (e.g., I12345), customer name, or phone..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(({ key, label }) => (
          <Button
            key={key}
            size="sm"
            variant={activeFilter === key ? "default" : "outline"}
            onClick={() => handleFilterChange(key)}
          >
            {label}
            {counts[key] !== undefined && counts[key] > 0 && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 text-xs">
                {counts[key]}
              </span>
            )}
          </Button>
        ))}

        <Button
          size="sm"
          variant="ghost"
          onClick={() => fetchOrders(page)}
          disabled={loading}
          className="ml-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/3 mb-3 animate-pulse" />
                <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No orders found</h3>
            <p className="text-sm text-muted-foreground">
              {activeFilter === "all"
                ? "No orders have been placed yet."
                : `No orders with status "${activeFilter}".`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
              onDelete={handleDelete}
              updatingId={updatingId}
            />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total} orders
              </p>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-sm">…</span>
                    ) : (
                      <Button
                        key={p}
                        size="sm"
                        variant={p === page ? "default" : "outline"}
                        onClick={() => handlePageChange(p as number)}
                        className="w-8 h-8 p-0"
                      >
                        {p}
                      </Button>
                    )
                  )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
