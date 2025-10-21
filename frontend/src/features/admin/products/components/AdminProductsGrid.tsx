import { AdminProductCard } from "./AdminProductCard";
import { type ProductDetail } from "@/lib/api";

interface AdminProductsGridProps {
  products: ProductDetail[];
  onEdit: (product: ProductDetail) => void;
  onDelete: (id: number) => void;
}

export function AdminProductsGrid({
  products,
  onEdit,
  onDelete,
}: AdminProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">
          No products found
        </div>
        <p className="text-sm text-muted-foreground">
          Create your first product to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <AdminProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
