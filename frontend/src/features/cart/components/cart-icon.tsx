"use client";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useCart } from "@/shared/hooks/use-cart";
import { ShoppingCart } from "lucide-react";

interface CartIconProps {
  onClick?: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
  const { itemCount } = useCart();

  return (
    <Button variant="ghost" size="sm" onClick={onClick} className="relative">
      <ShoppingCart className="h-4 w-4" />
      {itemCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
          {itemCount > 99 ? "99+" : itemCount}
        </Badge>
      )}
    </Button>
  );
}
