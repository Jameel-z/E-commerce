"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/shared/hooks/use-toast";
import { ImageUpload } from "@/features/products/components/ui/ImageUpload"; // ✅ Import new component
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components";
import type { ProductDetail, Category } from "@/lib/api";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  category_id: string;
  primary_image: File | null;
  secondary_images: File[];
}

interface ProductFormProps {
  mode: "create" | "edit";
  product?: ProductDetail;
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

const initialFormData: ProductFormData = {
  name: "",
  description: "",
  price: "",
  stock_quantity: "",
  category_id: "",
  primary_image: null,
  secondary_images: [],
};

export function ProductForm({
  mode,
  product,
  categories,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingPrimaryImage, setExistingPrimaryImage] = useState<
    string | null
  >(null);
  const [existingSecondaryImages, setExistingSecondaryImages] = useState<
    Array<{ id: number; url: string }>
  >([]);
  const [keepSecondaryImageIds, setKeepSecondaryImageIds] = useState<number[]>(
    []
  );
  const { toast } = useToast();

  const updateField = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.price || Number.parseFloat(formData.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid price is required",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (mode === "edit" && product) {
        // 🔥 EDIT MODE - Different data structure for backend
        const updateData = {
          name: formData.name,
          description: formData.description || undefined,
          price: Number.parseFloat(formData.price),
          stock_quantity: Number.parseInt(formData.stock_quantity) || 0,
          category_id: formData.category_id
            ? Number.parseInt(formData.category_id)
            : undefined,
          primary_image: formData.primary_image || undefined,
          keep_image_ids: keepSecondaryImageIds.join(","), // 🔑 CSV string for backend
          new_images: formData.secondary_images, // 🔑 New secondary images only
        };

        await apiClient.updateProduct(product.id, updateData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // 🔥 CREATE MODE - Original data structure
        const productData = {
          name: formData.name,
          description: formData.description || undefined,
          price: Number.parseFloat(formData.price),
          stock_quantity: Number.parseInt(formData.stock_quantity) || 0,
          category_id: formData.category_id
            ? Number.parseInt(formData.category_id)
            : undefined,
          primary_image: formData.primary_image || undefined,
          secondary_images: formData.secondary_images,
        };

        await apiClient.createProduct(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${mode} product`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (mode === "edit" && product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock_quantity: product.stock_quantity?.toString() || "",
        category_id: product.category_id?.toString() || "",
        primary_image: null,
        secondary_images: [],
      });

      // Load primary image
      setExistingPrimaryImage(product.primary_image_url || null);

      // Load secondary images (check both possible field names)
      const secondaryImages =
        (product as any).secondary_images || (product as any).images || [];
      if (secondaryImages && secondaryImages.length > 0) {
        const secondaryImagesWithIds = secondaryImages.map((img: any) => ({
          id: img.id,
          url: img.url || img.image_url,
        }));
        setExistingSecondaryImages(secondaryImagesWithIds);
        setKeepSecondaryImageIds(
          secondaryImagesWithIds.map((img: any) => img.id)
        );
      }
    } else {
      setFormData(initialFormData);
      setExistingPrimaryImage(null);
      setExistingSecondaryImages([]);
      setKeepSecondaryImageIds([]);
    }
  }, [mode, product]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{product ? "Edit Product" : "Create New Product"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <div className="w-full">
                <Select
                  value={formData.category_id || ""}
                  onValueChange={(value) =>
                    updateField("category_id", value === "" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <span className="block truncate text-left">
                      {formData.category_id ? (
                        categories.find(
                          (cat) => cat.id.toString() === formData.category_id
                        )?.name ||
                        `Unknown Category (ID: ${formData.category_id})`
                      ) : (
                        <span className="text-muted-foreground">
                          Select category (optional)
                        </span>
                      )}
                    </span>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="">No Category</SelectItem>
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
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Optional product description"
            />
          </div>

          <div className="space-y-6">
            <ImageUpload
              label="Primary Image"
              multiple={false}
              files={formData.primary_image ? [formData.primary_image] : []}
              existingImages={
                existingPrimaryImage ? [existingPrimaryImage] : []
              }
              onChange={(files) =>
                updateField("primary_image", files[0] || null)
              }
              onRemoveExisting={() => setExistingPrimaryImage(null)}
              accept="image/*"
              maxSize={5}
            />

            <ImageUpload
              label="Secondary Images"
              multiple={true}
              files={formData.secondary_images}
              existingImages={existingSecondaryImages.map((img) => img.url)}
              onChange={(files) => updateField("secondary_images", files)}
              onRemoveExisting={(imageUrl) => {
                const imageToRemove = existingSecondaryImages.find(
                  (img) => img.url === imageUrl
                );
                if (imageToRemove) {
                  setKeepSecondaryImageIds((prev) =>
                    prev.filter((id) => id !== imageToRemove.id)
                  );
                  setExistingSecondaryImages((prev) =>
                    prev.filter((img) => img.id !== imageToRemove.id)
                  );
                }
              }}
              accept="image/*"
              maxSize={5}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => updateField("price", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="stock_quantity">Stock Quantity</Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => updateField("stock_quantity", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : mode === "edit"
                ? "Update Product"
                : "Create Product"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
