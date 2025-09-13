import { Button, Card, CardContent } from "@/shared/components/ui";
import Link from "next/link";
import { Package } from "lucide-react";

interface ProductDetailErrorProps {
  error: string;
  onRetry?: () => void;
  className?: string;
}

export function ProductDetailError({
  error,
  onRetry,
  className = "",
}: ProductDetailErrorProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8">
          <Package className="h-16 w-16 mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-red-800">
            Product Not Found
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="w-full">
                Try Again
              </Button>
            )}
            <Button asChild className="w-full">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
