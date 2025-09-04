"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import {
  apiClient,
  type Product,
  type ProductDetail,
  type Category,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import Input from "@/shared/components/ui/input";
import Label from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Badge } from "@/shared/components/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import Image from "next/image";

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(
    null
  );
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    category_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCategories(),
      ]);
      // For admin, we need detailed product info, so fetch each product detail
      const detailedProducts = await Promise.all(
        productsData.map((product) => apiClient.getProduct(product.id))
      );
      setProducts(detailedProducts);
      setCategories(categoriesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      stock_quantity: Number.parseInt(formData.stock_quantity),
      category_id: Number.parseInt(formData.category_id),
    };

    try {
      if (editingProduct) {
        await apiClient.updateProduct(editingProduct.id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await apiClient.createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      resetForm();
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (product: ProductDetail) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      category_id: product.category_id.toString(),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await apiClient.deleteProduct(id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      category_id: "",
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Product Management">
        <div className="text-center py-8">Loading products...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Product Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              Products ({products.length})
            </h3>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, category_id: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_quantity: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingProduct ? "Update Product" : "Create Product"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={
                      product.primary_image_url ||
                      `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(
                        product.name
                      )}`
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <Badge
                      variant={
                        product.stock_quantity > 10
                          ? "default"
                          : product.stock_quantity > 0
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {product.stock_quantity} in stock
                    </Badge>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
                      className="flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your first product to the catalog
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Product
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
