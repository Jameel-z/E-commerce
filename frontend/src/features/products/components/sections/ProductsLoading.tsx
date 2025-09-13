// src/shared/components/sections/ProductsLoading.tsx
export function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="h-96 bg-muted animate-pulse rounded-lg"></div>
          </div>
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 bg-muted animate-pulse rounded-lg"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
