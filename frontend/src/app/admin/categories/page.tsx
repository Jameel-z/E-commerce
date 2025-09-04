"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { apiClient, type Category } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import Input from "@/shared/components/ui/input";
import Label from "@/shared/components/ui/label";
import { useToast } from "@/shared/hooks/use-toast";
import { Plus, Trash2, FolderOpen } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await apiClient.getCategories();
      setCategories(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCategoryName.trim()) return;

    try {
      await apiClient.createCategory(newCategoryName.trim());
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      setNewCategoryName("");
      setShowForm(false);
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This may affect products in this category."
      )
    )
      return;

    try {
      await apiClient.deleteCategory(id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      fetchCategories();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Category Management">
        <div className="text-center py-8">Loading categories...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Category Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              Categories ({categories.length})
            </h3>
            <p className="text-muted-foreground">
              Organize your products into categories
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Category</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setNewCategoryName("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-4">
                Create categories to organize your products
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(category.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
