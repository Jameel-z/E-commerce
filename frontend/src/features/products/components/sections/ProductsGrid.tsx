import { ProductCard } from "@/features/products/components";
import { type Product } from "@/shared/types";
import { PackageX } from "lucide-react";

interface ProductsGridProps {
  products: Product[];
}

export function ProductsGrid({ products }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
        <PackageX className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-semibold text-foreground mb-2">
          No products found
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          We couldn't find any products matching your criteria. Try adjusting
          your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
