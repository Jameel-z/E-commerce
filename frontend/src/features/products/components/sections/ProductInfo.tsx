import React from "react";
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
  const p = product as any;

  const metaRows = [
    p.sku ? { label: "SKU", value: p.sku } : null,
    product.category?.name ? { label: "Categories", value: product.category.name } : null,
    p.tags ? { label: "Tag", value: p.tags } : null,
    p.brand ? { label: "Brand", value: <strong>{p.brand}</strong> } : null,
  ].filter(Boolean) as { label: string; value: React.ReactNode }[];

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

      {/* Availability Status */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Availability:</span>
        {product.stock_quantity > 0 ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
              In Stock
            </Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              Available on Request
            </Badge>
          </div>
        )}
      </div>

      {/* SKU / Categories / Tag / Brand */}
      {metaRows.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          {metaRows.map(({ label, value }) => (
            <div key={label} className="flex gap-2 text-sm">
              <span className="text-muted-foreground w-24 shrink-0">{label}:</span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
