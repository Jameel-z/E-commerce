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
  stock_quantity: string;
  category_id: string;
  primary_image: File | null;
  secondary_images: File[];
  regular_price: string;
  sale_price: string;
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
  stock_quantity: "",
  category_id: "",
  primary_image: null,
  secondary_images: [],
  regular_price: "",
  sale_price: "",
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

    if (
      !formData.regular_price ||
      Number.parseFloat(formData.regular_price) <= 0
    ) {
      toast({
        title: "Validation Error",
        description: "Regular price is required and must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    // Validate sale price if provided
    const regularPrice = Number.parseFloat(formData.regular_price);
    const salePrice = formData.sale_price
      ? Number.parseFloat(formData.sale_price)
      : null;

    if (salePrice && salePrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Sale price must be greater than 0",
        variant: "destructive",
      });
      return false;
    }

    if (salePrice && salePrice >= regularPrice) {
      toast({
        title: "Validation Error",
        description: "Sale price must be less than regular price",
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
        const regularPrice = Number.parseFloat(formData.regular_price);
        const salePrice = formData.sale_price
          ? Number.parseFloat(formData.sale_price)
          : null;

        const updateData = {
          name: formData.name,
          description: formData.description || undefined,
          price: salePrice || regularPrice, // Use sale price if available, otherwise regular price
          stock_quantity: Number.parseInt(formData.stock_quantity) || 0,
          category_id: formData.category_id
            ? Number.parseInt(formData.category_id)
            : undefined,
          primary_image: formData.primary_image || undefined,
          keep_image_ids: keepSecondaryImageIds.join(","), // 🔑 CSV string for backend
          new_images: formData.secondary_images, // 🔑 New secondary images only
          regular_price: regularPrice,
          sale_price: salePrice || undefined,
        };

        await apiClient.updateProduct(product.id, updateData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        // 🔥 CREATE MODE - Original data structure
        const regularPrice = Number.parseFloat(formData.regular_price);
        const salePrice = formData.sale_price
          ? Number.parseFloat(formData.sale_price)
          : null;

        const productData = {
          name: formData.name,
          description: formData.description || undefined,
          price: salePrice || regularPrice, // Use sale price if available, otherwise regular price
          stock_quantity: Number.parseInt(formData.stock_quantity) || 0,
          category_id: formData.category_id
            ? Number.parseInt(formData.category_id)
            : undefined,
          primary_image: formData.primary_image || undefined,
          secondary_images: formData.secondary_images,
          regular_price: regularPrice,
          sale_price: salePrice || undefined,
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
      // For existing products without sale pricing, use current price as regular_price
      const regularPrice =
        product.regular_price?.toString() || product.price?.toString() || "";
      const salePrice = product.sale_price?.toString() || "";

      setFormData({
        name: product.name || "",
        description: product.description || "",
        stock_quantity: product.stock_quantity?.toString() || "",
        category_id: product.category_id?.toString() || "",
        primary_image: null,
        secondary_images: [],
        regular_price: regularPrice,
        sale_price: salePrice,
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

          {/* Pricing Section */}
          <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Pricing</h3>
                <p className="text-sm text-muted-foreground">
                  Set regular price and optional sale price
                </p>
              </div>
              {formData.regular_price &&
                formData.sale_price &&
                Number.parseFloat(formData.sale_price) <
                  Number.parseFloat(formData.regular_price) && (
                  <span className="text-lg font-bold text-destructive">
                    -
                    {Math.round(
                      (1 -
                        Number.parseFloat(formData.sale_price) /
                          Number.parseFloat(formData.regular_price)) *
                        100
                    )}
                    % OFF
                  </span>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="regular_price">
                  Regular Price ($) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="regular_price"
                  type="number"
                  step="0.01"
                  value={formData.regular_price}
                  onChange={(e) => updateField("regular_price", e.target.value)}
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Original/Display price
                </p>
              </div>
              <div>
                <Label htmlFor="sale_price">Sale Price ($)</Label>
                <Input
                  id="sale_price"
                  type="number"
                  step="0.01"
                  value={formData.sale_price}
                  onChange={(e) => updateField("sale_price", e.target.value)}
                  placeholder="Optional"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Discounted price (must be less than regular)
                </p>
              </div>
            </div>

            {/* Sale Preview */}
            {formData.regular_price &&
              formData.sale_price &&
              Number.parseFloat(formData.sale_price) <
                Number.parseFloat(formData.regular_price) && (
                <div className="bg-background p-4 rounded-lg border-2 border-destructive/20">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    Customer will see:
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-destructive">
                      ${Number.parseFloat(formData.sale_price).toFixed(2)}
                    </span>
                    <span className="text-lg text-muted-foreground line-through">
                      ${Number.parseFloat(formData.regular_price).toFixed(2)}
                    </span>
                    <span className="bg-destructive text-destructive-foreground px-2 py-1 rounded text-xs font-bold">
                      SALE
                    </span>
                  </div>
                </div>
              )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
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
