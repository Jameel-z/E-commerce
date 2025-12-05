import { Badge } from "@/shared/components/ui";
import { PriceDisplay } from "@/shared/components/products/atoms/PriceDisplay";
import { type ProductDetail } from "@/lib/api";

interface ProductInfoProps {
  product: ProductDetail;
  className?: string;
}

export function ProductInfo({ product, className = "" }: ProductInfoProps) {
  // For products without sale pricing, use the price field
  const regularPrice = product.regular_price || product.price;
  const salePrice = product.sale_price;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Product Name and Price */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
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

      {/* Description */}
      <div>
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Availability Status - Customer Friendly */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Availability:</span>
        {product.stock_quantity > 0 ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Badge
              variant="default"
              className="bg-green-100 text-green-800 border-green-200"
            >
              In Stock
            </Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <Badge
              variant="secondary"
              className="bg-orange-100 text-orange-800 border-orange-200"
            >
              Available on Request
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
