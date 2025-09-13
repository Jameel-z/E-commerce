import { Button } from "@/shared/components";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";

export function ProductsHeader() {
  return (
    <div className="border-b bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-secondary" />
            <h1 className="text-2xl font-bold">Products</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
