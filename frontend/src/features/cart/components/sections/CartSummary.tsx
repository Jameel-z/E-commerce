import { Button } from "@/shared/components/ui/button";
import { Separator } from "@/shared/components/ui/separator";
import { ShoppingCart, CreditCard } from "lucide-react";
import { CartSummaryData } from "@/features/cart/types/cart.types";

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

interface CartSummaryProps {
  data: CartSummaryData;
  itemCount: number;
  onCheckout: () => void;
  isLoading?: boolean;
}

export function CartSummary({
  data,
  itemCount,
  onCheckout,
  isLoading = false,
}: CartSummaryProps) {
  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Order Summary</h2>
      </div>

      {/* Summary Details */}
      <div className="space-y-3">
        {/* Item Count */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Items ({itemCount})</span>
          <span className="text-foreground">
            {formatCurrency(data.subtotal)}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-foreground">
            {data.shipping > 0 ? formatCurrency(data.shipping) : "Free"}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span className="text-foreground">{formatCurrency(data.tax)}</span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex justify-between">
          <span className="text-base font-semibold text-foreground">Total</span>
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(data.total)}
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <Button
        onClick={onCheckout}
        disabled={isLoading || itemCount === 0}
        className="w-full mt-6 h-12"
        size="lg"
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {isLoading ? "Processing..." : "Proceed to Checkout"}
      </Button>

      {/* Additional Info */}
      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
        <p>• Free shipping on orders over $50</p>
        <p>• 30-day return policy</p>
        <p>• Secure checkout with SSL encryption</p>
      </div>
    </div>
  );
}
