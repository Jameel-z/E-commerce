import { UnifiedLayout } from "@/shared/components";
import { ProductNotFound } from "@/features/products/components";

// Shown with a real 404 status when a product id doesn't exist.
export default function ProductNotFoundPage() {
  return (
    <UnifiedLayout
      pageHeaderProps={{
        backButton: { label: "Back to Products", href: "/products" },
        title: "Product not found",
      }}
    >
      <ProductNotFound />
    </UnifiedLayout>
  );
}
