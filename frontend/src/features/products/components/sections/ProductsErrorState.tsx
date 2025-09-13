import { Button, Card, CardContent } from "@/shared/components/ui";
import { Package } from "lucide-react";

export function ProductsErrorState() {
  return (
    <div className="text-center py-12">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8">
          <Package className="h-16 w-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-red-800">
            Connection Error
          </h3>
          <p className="text-red-600 mb-4">
            Unable to load products from the server.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
