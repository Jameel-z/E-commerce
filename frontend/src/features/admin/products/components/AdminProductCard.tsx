"use client";

import {
  Card,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from "@/shared/components";
import { getProductImageUrl } from "@/shared/utils";
import { useState } from "react";
import Image from "next/image";
import { Edit, Trash2, Eye } from "lucide-react";
import { type ProductDetail } from "@/lib/api";

interface AdminProductCardProps {
  product: ProductDetail;
  onEdit: (product: ProductDetail) => void;
  onDelete: (id: number) => void;
}

export function AdminProductCard({
  product,
  onEdit,
  onDelete,
}: AdminProductCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      setIsDeleting(true);
      try {
        await onDelete(product.id);
      } catch (error) {
        console.error("Failed to delete product:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Convert ProductDetail to Product format for image URL function
  const productForImage = {
    id: product.id,
    name: product.name,
    price: Number(product.price),
    primary_image_url: product.primary_image_url,
    category_name: product.category?.name || "Uncategorized",
    stock_quantity: product.stock_quantity,
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-secondary/50">
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={getProductImageUrl(productForImage)}
            alt={product.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {product.stock_quantity === 0 && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Out of Stock
            </Badge>
          )}
          {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              Low Stock
            </Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-secondary transition-colors">
            {product.name}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            Category: {product.category?.name || "Uncategorized"}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${Number(product.price).toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              Stock: {product.stock_quantity}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(product)}
          className="flex-1 bg-transparent"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>
      </CardFooter>
    </Card>
  );
}
