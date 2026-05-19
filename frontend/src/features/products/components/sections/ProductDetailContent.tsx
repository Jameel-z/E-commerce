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
  const fullDescription = (product as any).full_description;

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 ${className}`}>
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
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

      {/* Full Description */}
      {fullDescription && (
        <div className="mt-10 border-t pt-8">
          <h2 className="text-xl font-bold mb-4">Product Description</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1
              [&_table]:w-full [&_table]:border-collapse
              [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_td]:text-sm
              [&_th]:border [&_th]:border-gray-300 [&_th]:p-2 [&_th]:bg-gray-100 [&_th]:font-semibold [&_th]:text-sm
              [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:text-gray-600 [&_blockquote]:italic
              [&_a]:text-blue-600 [&_a]:underline [&_a]:hover:text-blue-800
              [&_strong]:font-semibold [&_em]:italic [&_u]:underline
              [&_hr]:border-gray-200 [&_hr]:my-4
              [&_p]:mb-2 [&_li]:mb-0.5"
            dangerouslySetInnerHTML={{ __html: fullDescription }}
          />
        </div>
      )}
    </div>
  );
}
