"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";
import { AdminProductsGrid } from "@/features/admin/products/components/AdminProductsGrid";
import { AdminProductsGridLoading } from "@/features/admin/products/components/AdminProductsGridLoading";
import { ProductForm } from "@/features/admin/products/components/ProductForm";
import { useProducts } from "@/features/admin/products/hooks/useProducts";
import type { ProductDetail } from "@/lib/api";

export default function AdminProducts() {
  const { products, categories, loading, refetch, deleteProduct } =
    useProducts();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(
    null
  );

  const handleEdit = (product: ProductDetail) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    refetch();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <AdminLayout title="Product Management">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Products</h3>
              <p className="text-muted-foreground">
                Manage your product catalog
              </p>
            </div>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
          <AdminProductsGridLoading />
        </div>
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
          <Button onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {showForm && (
          <ProductForm
            mode={editingProduct ? "edit" : "create"}
            product={editingProduct || undefined}
            categories={categories}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        <AdminProductsGrid
          products={products}
          onEdit={handleEdit}
          onDelete={deleteProduct}
        />
      </div>
    </AdminLayout>
  );
}
