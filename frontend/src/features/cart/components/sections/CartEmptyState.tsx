import { Button, Card, CardContent } from "@/shared/components/ui";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface CartEmptyStateProps {
  className?: string;
}

export function CartEmptyState({ className = "" }: CartEmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any items to your cart yet
          </p>
          <Button asChild>
            <Link href="/products">Start Shopping</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
