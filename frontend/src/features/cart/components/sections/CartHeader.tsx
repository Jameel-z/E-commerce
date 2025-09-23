import { Button } from "@/shared/components/ui";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Trash2 } from "lucide-react";

interface CartHeaderProps {
  itemCount?: number;
  onClearCart?: () => void;
  className?: string;
}

export function CartHeader({
  itemCount,
  onClearCart,
  className = "",
}: CartHeaderProps) {
  return (
    <header className={`border-b bg-card ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Continue Shopping
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Shopping Cart</h1>
              {itemCount !== undefined && (
                <span className="text-sm text-muted-foreground">
                  ({itemCount} {itemCount === 1 ? "item" : "items"})
                </span>
              )}
            </div>
          </div>

          {onClearCart && itemCount && itemCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCart}
              className="text-destructive hover:text-destructive bg-transparent"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Cart
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
