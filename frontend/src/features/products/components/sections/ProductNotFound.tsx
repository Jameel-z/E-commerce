import { Button } from "@/shared/components/ui";
import Link from "next/link";
import { Package } from "lucide-react";

interface ProductNotFoundProps {
  className?: string;
}

export function ProductNotFound({ className = "" }: ProductNotFoundProps) {
  return (
    <div
      className={`min-h-screen bg-background flex items-center justify-center ${className}`}
    >
      <div className="text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-4">
          The product you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    </div>
  );
}
