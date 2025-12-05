"use client";

import React, { useState } from "react";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { Button } from "@/shared/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ProductManager } from "@/shared/components/products/ProductManager";
import { ProductForm } from "@/features/admin/products/components/ProductForm";
import { apiClient, type ProductDetail, type Category } from "@/lib/api";
import { Product } from "@/shared/types/api.types";

export default function AdminProductsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDetail | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories for the form
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiClient.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleEdit = async (product: Product) => {
    try {
      // Fetch full product details for editing
      const fullProduct = await apiClient.getProduct(product.id);
      setEditingProduct(fullProduct);
      setShowForm(true);
    } catch (error) {
      console.error("Failed to fetch product details:", error);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await apiClient.deleteProduct(productId);
      // Trigger refetch through ProductManager context
      window.location.reload(); // Simple reload for now
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    window.location.reload(); // Trigger refetch
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const renderProductActions = (product: Product) => (
    <div className="flex flex-col gap-2 w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleEdit(product)}
        className="w-full"
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleDelete(product.id)}
        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </div>
  );

  return (
    <AdminLayout title="Product Management">
      <div className="space-y-6 max-w-full">
        {/* Form */}
        {showForm && (
          <ProductForm
            mode={editingProduct ? "edit" : "create"}
            product={editingProduct || undefined}
            categories={categories}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {/* Product Manager */}
        <ProductManager defaultPageSize={10}>
          {/* Header with Add Product Button */}
          <ProductManager.Header
            showSearch={true}
            showSort={true}
            showItemsPerPage={true}
            actions={
              <Button onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            }
          />

          {/* Product Grid */}
          <ProductManager.Grid
            cardVariant="compact"
            columns={5}
            showPagination={true}
            showActions={true}
            renderActions={renderProductActions}
          />
        </ProductManager>
      </div>
    </AdminLayout>
  );
}
