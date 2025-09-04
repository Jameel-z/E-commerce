"use client";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useCart } from "@/shared/hooks/use-cart";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Button variant="ghost" size="sm" asChild className="relative">
      <Link href="/cart">
        <ShoppingCart className="h-4 w-4" />
        {itemCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
            {itemCount > 99 ? "99+" : itemCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
