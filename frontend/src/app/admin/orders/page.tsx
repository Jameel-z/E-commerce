"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { apiClient, type Order } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { ShoppingCart, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Try to get all orders (admin endpoint), fallback to regular orders
      const data = await apiClient
        .getAllOrders()
        .catch(() => apiClient.getOrders());
      setOrders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await apiClient.updateOrderStatus(orderId, newStatus);
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      fetchOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

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

  if (loading) {
    return (
      <AdminLayout title="Order Management">
        <div className="text-center py-8">Loading orders...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Order Management">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold">Orders ({orders.length})</h3>
          <p className="text-muted-foreground">
            Manage customer orders and update their status
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground">
                Orders will appear here when customers make purchases
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <p className="font-medium">User #{order.user_id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="font-medium">
                        ${order.total_amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Update Status
                      </p>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          handleStatusUpdate(order.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {order.order_items && order.order_items.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">
                        Items:
                      </p>
                      <div className="space-y-1">
                        {order.order_items.slice(0, 3).map((item) => (
                          <p key={item.id} className="text-sm">
                            {item.quantity}x {item.product_name} - $
                            {item.total_price.toFixed(2)}
                          </p>
                        ))}
                        {order.order_items.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{order.order_items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
