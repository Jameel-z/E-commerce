import { Badge } from "@/shared/components/ui";
import { type ProductDetail } from "@/lib/api";

interface ProductInfoProps {
  product: ProductDetail;
  className?: string;
}

export function ProductInfo({ product, className = "" }: ProductInfoProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Product Name and Price */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {product.name}
        </h1>
        <p className="text-2xl font-bold text-secondary">
          ${Number(product.price).toFixed(2)}
        </p>
      </div>

      {/* Description */}
      <div>
        <h3 className="font-semibold mb-2">Description</h3>
        <p className="text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      </div>

      {/* Stock Information */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Stock:</span>
        <Badge
          variant={
            product.stock_quantity > 10
              ? "default"
              : product.stock_quantity > 0
              ? "secondary"
              : "destructive"
          }
        >
          {product.stock_quantity > 0
            ? `${product.stock_quantity} available`
            : "Out of stock"}
        </Badge>
      </div>
    </div>
  );
}
