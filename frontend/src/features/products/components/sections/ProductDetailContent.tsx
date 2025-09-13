import {
  AddToCartSection,
  ProductImageGallery,
  ProductInfo,
} from "@/features/products/components";
import { type ProductDetail } from "@/lib/api";

interface ProductDetailContentProps {
  product: ProductDetail;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
  className?: string;
}

export function ProductDetailContent({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAddingToCart,
  className = "",
}: ProductDetailContentProps) {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image Gallery */}
        <ProductImageGallery product={product} />

        {/* Product Details */}
        <div className="space-y-6">
          <ProductInfo product={product} />
          <AddToCartSection
            product={product}
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            onAddToCart={onAddToCart}
            isAddingToCart={isAddingToCart}
          />
        </div>
      </div>
    </div>
  );
}
