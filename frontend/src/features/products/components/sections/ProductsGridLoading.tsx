import { Card, CardContent } from "@/shared/components/ui";

export function ProductsGridLoading() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <div className="h-48 bg-muted rounded-t-lg"></div>
          <CardContent className="p-4">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-3 bg-muted rounded mb-4"></div>
            <div className="h-8 bg-muted rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
