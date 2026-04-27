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
import { Plus, Trash2, FolderOpen, Folder, ChevronDown } from "lucide-react";

export default function AdminCategories() {
  const [tree, setTree] = useState<Category[]>([]);
  const [flatList, setFlatList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const [treeData, flatData] = await Promise.all([
        apiClient.getCategoryTree(),
        apiClient.getCategories(),
      ]);
      setTree(treeData);
      setFlatList(flatData);
    } catch {
      toast({ title: "Error", description: "Failed to load categories", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await apiClient.createCategory(newName.trim(), parentId);
      toast({ title: "Success", description: "Category created" });
      setNewName("");
      setParentId(null);
      setShowForm(false);
      fetchCategories();
    } catch (err: any) {
      const msg = err?.message?.includes("already exists")
        ? "A category with that name already exists."
        : "Failed to create category.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? Products in this category will become uncategorized.`)) return;
    try {
      await apiClient.deleteCategory(id);
      toast({ title: "Deleted", description: `"${name}" removed` });
      fetchCategories();
    } catch {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    }
  };

  // Only top-level categories can be parents (one level of nesting enforced by API)
  const topLevel = flatList.filter((c) => c.parent_id === null);

  if (loading) {
    return (
      <AdminLayout title="Category Management">
        <div className="text-center py-8">Loading categories…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Category Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">
              Categories ({flatList.length})
            </h3>
            <p className="text-muted-foreground text-sm">
              Organize products into parent → subcategory groups
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Create form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Lenovo"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="parent">Parent Category <span className="text-muted-foreground">(optional)</span></Label>
                    <div className="relative">
                      <select
                        id="parent"
                        value={parentId ?? ""}
                        onChange={(e) =>
                          setParentId(e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-full h-10 pl-3 pr-8 text-sm bg-background border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">— Top-level (no parent) —</option>
                        {topLevel.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowForm(false); setNewName(""); setParentId(null); }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tree view */}
        {tree.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {tree.map((parent) => (
              <Card key={parent.id}>
                <CardContent className="p-4 space-y-2">
                  {/* Parent row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{parent.name}</span>
                      {parent.children.length > 0 && (
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          {parent.children.length} sub
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(parent.id, parent.name)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Children */}
                  {parent.children.length > 0 && (
                    <div className="ml-6 border-l pl-4 space-y-1">
                      {parent.children.map((child) => (
                        <div key={child.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Folder className="h-4 w-4" />
                            <span>{child.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(child.id, child.name)}
                            className="text-destructive hover:text-destructive h-7 w-7 p-0"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Uncategorized top-level that also appear in flatList but NOT in tree (orphaned) */}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
