import { Badge } from "@/shared/components/ui";
import { PriceDisplay } from "@/shared/components/products/atoms/PriceDisplay";
import { type ProductDetail } from "@/lib/api";

interface ProductInfoProps {
  product: ProductDetail;
  className?: string;
}

export function ProductInfo({ product, className = "" }: ProductInfoProps) {
  const regularPrice = product.regular_price || product.price;
  const salePrice = product.sale_price;

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Product Name and Price */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
          {product.name}
        </h1>
        <PriceDisplay
          regularPrice={regularPrice}
          salePrice={salePrice}
          discountPercentage={product.discount_percentage}
          size="lg"
          showDiscount={true}
        />
      </div>

      {/* Short Description — rendered as rich HTML */}
      {product.description && (
        <div
          className="prose prose-sm max-w-none text-muted-foreground
            [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold
            [&_h3]:text-lg [&_h3]:font-semibold
            [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5
            [&_strong]:font-semibold [&_em]:italic [&_u]:underline
            [&_a]:text-blue-600 [&_a]:underline [&_p]:mb-1"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      )}

      {/* Availability */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          {product.stock_quantity > 0 ? (
            <span className="text-green-600">In stock</span>
          ) : (
            <span className="text-orange-500">Available on Request</span>
          )}
        </span>
      </div>
    </div>
  );
}
