import { Button } from "@/shared/components/ui";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ProductDetailHeaderProps {
  className?: string;
}

export function ProductDetailHeader({
  className = "",
}: ProductDetailHeaderProps) {
  return (
    <div className={`border-b bg-card/50 backdrop-blur-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/products">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </Button>
      </div>
    </div>
  );
}
