"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { apiClient } from "@/lib/api";
import { Package, ShoppingCart, DollarSign, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders] = await Promise.all([
          apiClient.getProducts(),
          apiClient.getAllOrders().catch(() => []), // Fallback if admin orders endpoint fails
        ]);

        const totalRevenue = orders.reduce(
          (sum, order) => sum + order.total_amount,
          0
        );
        const lowStockProducts = products.filter(
          (product) => product.stock_quantity < 10
        ).length;

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          lowStockProducts,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="text-center py-8">Loading dashboard...</div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-yellow-600",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockProducts,
      icon: TrendingUp,
      color: "text-red-600",
    },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                <div className="text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Add Product</p>
                </div>
              </Card>
              <Card className="p-4 hover:bg-accent cursor-pointer transition-colors">
                <div className="text-center">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">View Orders</p>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm">System running smoothly</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">Dashboard loaded successfully</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <p className="text-sm">
                  {stats.lowStockProducts} products need restocking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
