"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { apiClient, type Order } from "@/lib/api";
import {
  Package,
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RotateCcw,
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; Icon: React.ElementType }
> = {
  pending:    { label: "Pending",    color: "text-yellow-600", bg: "bg-yellow-500", Icon: Clock },
  processing: { label: "Processing", color: "text-blue-600",   bg: "bg-blue-500",   Icon: RotateCcw },
  shipped:    { label: "Shipped",    color: "text-purple-600", bg: "bg-purple-500", Icon: Truck },
  delivered:  { label: "Delivered",  color: "text-green-600",  bg: "bg-green-500",  Icon: CheckCircle2 },
  cancelled:  { label: "Cancelled",  color: "text-red-600",    bg: "bg-red-500",    Icon: XCircle },
};

export default function AdminDashboard() {
  const [productStats, setProductStats] = useState({ total: 0, lowStock: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [products, allOrders] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getAllOrders(),
        ]);
        setProductStats({
          total: products.length,
          lowStock: products.filter((p) => p.stock_quantity < 10).length,
        });
        setOrders(allOrders);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const statusCounts = Object.keys(STATUS_CONFIG).reduce<Record<string, number>>(
    (acc, key) => {
      acc[key] = orders.filter((o) => o.status === key).length;
      return acc;
    },
    {}
  );

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="text-center py-8">Loading dashboard...</div>
      </AdminLayout>
    );
  }

  const statCards = [
    { title: "Total Products", value: productStats.total,           icon: Package,      color: "text-blue-600" },
    { title: "Low Stock",      value: productStats.lowStock,        icon: TrendingUp,   color: "text-red-600" },
    { title: "Total Orders",   value: orders.length,                icon: ShoppingCart, color: "text-purple-600" },
    { title: "Revenue",        value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign,   color: "text-green-600" },
  ];

  const recentOrders = orders.slice(0, 6);

  return (
    <AdminLayout title="Dashboard">
      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const count = statusCounts[key] ?? 0;
              const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <cfg.Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      <span className="font-medium">{cfg.label}</span>
                    </div>
                    <span className="text-muted-foreground tabular-nums">
                      {count} <span className="text-xs">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${cfg.bg}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No orders yet
              </p>
            ) : (
              <div className="divide-y">
                {recentOrders.map((order) => {
                  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground text-xs">
                          #{order.id}
                        </span>
                        <span
                          className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-muted ${cfg.color}`}
                        >
                          <cfg.Icon className="h-3 w-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${Number(order.total_amount).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
