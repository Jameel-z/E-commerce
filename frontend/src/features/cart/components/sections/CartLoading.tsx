import { GlobalHeader, PageHeader } from "@/shared/components";

export function CartLoading() {
  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader />
      <PageHeader
        backButton={{
          label: "Continue Shopping",
          href: "/products",
        }}
        title="Shopping Cart"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items Skeleton */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6"></div>

            {/* Cart Item Skeletons */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-muted animate-pulse rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4"></div>
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                    <div className="h-6 bg-muted animate-pulse rounded w-1/4"></div>
                  </div>
                  <div className="w-24 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded"></div>
                    <div className="h-8 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Skeleton */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-6 space-y-4">
              <div className="h-6 bg-muted animate-pulse rounded w-1/2"></div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 bg-muted animate-pulse rounded w-1/3"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
                  <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <div className="h-5 bg-muted animate-pulse rounded w-1/3"></div>
                    <div className="h-5 bg-muted animate-pulse rounded w-1/3"></div>
                  </div>
                </div>
              </div>
              <div className="h-12 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
