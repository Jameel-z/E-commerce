export function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted animate-pulse rounded-lg"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted animate-pulse rounded-md"
                ></div>
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div className="space-y-2">
              <div className="h-8 bg-muted animate-pulse rounded"></div>
              <div className="h-6 bg-muted animate-pulse rounded w-1/3"></div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="h-5 bg-muted animate-pulse rounded w-1/4"></div>
              <div className="h-32 bg-muted animate-pulse rounded"></div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-4">
              <div className="h-4 bg-muted animate-pulse rounded w-12"></div>
              <div className="h-6 bg-muted animate-pulse rounded w-24"></div>
            </div>

            {/* Add to Cart Section */}
            <div className="border bg-card rounded-lg p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted animate-pulse rounded w-16"></div>
                <div className="h-10 bg-muted animate-pulse rounded"></div>
              </div>
              <div className="h-12 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
