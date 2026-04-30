"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/features/admin/components/admin-layout";
import { apiClient, type Category } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import Input from "@/shared/components/ui/input";
import Label from "@/shared/components/ui/label";
import { useToast } from "@/shared/hooks/use-toast";
import { Plus, Trash2, FolderOpen, Folder, ChevronDown, Edit2, X, ImageIcon } from "lucide-react";
import { getImageUrl } from "@/shared/utils/image";

interface CategoryFormState {
  name: string;
  parentId: number | null;
  image: File | null;
  previewUrl: string | null;
}

const emptyForm = (): CategoryFormState => ({ name: "", parentId: null, image: null, previewUrl: null });

export default function AdminCategories() {
  const [tree, setTree] = useState<Category[]>([]);
  const [flatList, setFlatList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyForm());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => { fetchCategories(); }, []);

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

  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      parentId: cat.parent_id,
      image: null,
      previewUrl: cat.image_url ? getImageUrl(cat.image_url) : null,
    });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setForm(emptyForm());
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setForm((f) => ({ ...f, image: file, previewUrl: URL.createObjectURL(file) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      if (editingCategory) {
        await apiClient.updateCategory(editingCategory.id, {
          name: form.name.trim(),
          parentId: form.parentId,
          image: form.image,
        });
        toast({ title: "Updated", description: "Category updated successfully" });
      } else {
        await apiClient.createCategory(form.name.trim(), form.parentId, form.image);
        toast({ title: "Created", description: "Category created successfully" });
      }
      closeForm();
      fetchCategories();
    } catch (err: any) {
      const msg = err?.message?.includes("already exists")
        ? "A category with that name already exists."
        : "Failed to save category.";
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
            <h3 className="text-lg font-semibold">Categories ({flatList.length})</h3>
            <p className="text-muted-foreground text-sm">Organize products into parent → subcategory groups</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Create / Edit form */}
        {showForm && (
          <div ref={formRef}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingCategory ? `Edit "${editingCategory.name}"` : "New Category"}</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={closeForm}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Laptops"
                      required
                    />
                  </div>

                  {/* Parent */}
                  <div className="space-y-1.5">
                    <Label htmlFor="parent">Parent Category <span className="text-muted-foreground">(optional)</span></Label>
                    <div className="relative">
                      <select
                        id="parent"
                        value={form.parentId ?? ""}
                        onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value ? Number(e.target.value) : null }))}
                        className="w-full h-10 pl-3 pr-8 text-sm bg-background border rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        <option value="">— Top-level (no parent) —</option>
                        {topLevel
                          .filter((c) => !editingCategory || c.id !== editingCategory.id)
                          .map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Image upload */}
                <div className="space-y-1.5">
                  <Label>Category Image <span className="text-muted-foreground">(optional)</span></Label>
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div
                      className="w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden flex-shrink-0 bg-muted cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {form.previewUrl ? (
                        <img src={form.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        {form.previewUrl ? "Change Image" : "Upload Image"}
                      </Button>
                      {form.previewUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive ml-2"
                          onClick={() => setForm((f) => ({ ...f, image: null, previewUrl: null }))}
                        >
                          Remove
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">JPG, PNG or WebP · max 5MB</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{editingCategory ? "Save Changes" : "Create"}</Button>
                  <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>
        )}

        {/* Tree view */}
        {tree.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
              <Button onClick={openCreate}>
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
                    <div className="flex items-center gap-3">
                      {parent.image_url ? (
                        <img
                          src={getImageUrl(parent.image_url) ?? ""}
                          alt={parent.name}
                          className="w-9 h-9 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                          <FolderOpen className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <span className="font-semibold">{parent.name}</span>
                      {parent.children.length > 0 && (
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                          {parent.children.length} sub
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(parent)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(parent.id, parent.name)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Children */}
                  {parent.children.length > 0 && (
                    <div className="ml-6 border-l pl-4 space-y-1">
                      {parent.children.map((child) => (
                        <div key={child.id} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {child.image_url ? (
                              <img src={getImageUrl(child.image_url) ?? ""} alt={child.name} className="w-6 h-6 rounded-full object-cover border" />
                            ) : (
                              <Folder className="h-4 w-4" />
                            )}
                            <span>{child.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(child)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(child.id, child.name)} className="text-destructive hover:text-destructive h-7 w-7 p-0">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
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
