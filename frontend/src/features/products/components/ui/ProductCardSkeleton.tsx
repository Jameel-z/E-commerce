import { Card, CardContent, CardFooter } from "@/shared/components";

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col h-full animate-pulse">
      <CardContent className="p-0 flex-grow flex flex-col">
        {/* Image Skeleton */}
        <div className="w-full h-56 bg-muted rounded-t-lg" />

        {/* Content Skeleton */}
        <div className="p-4 flex-grow flex flex-col space-y-3">
          {/* Category Badge */}
          <div className="h-5 w-20 bg-muted rounded-full" />

          {/* Product Name */}
          <div className="h-6 w-3/4 bg-muted rounded" />

          {/* Description */}
          <div className="h-4 w-full bg-muted rounded" />

          {/* Price */}
          <div className="h-8 w-24 bg-muted rounded mt-2" />

          {/* Stock Info */}
          <div className="mt-auto">
            <div className="h-4 w-16 bg-muted rounded" />
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        {/* Button Skeletons */}
        <div className="h-11 w-full bg-muted rounded-md" />
        <div className="h-9 w-full bg-muted rounded-md" />
      </CardFooter>
    </Card>
  );
}
