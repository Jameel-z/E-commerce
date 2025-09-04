"use client";

import { Package } from "lucide-react";

interface ErrorBannerProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorBanner({ error, onRetry }: ErrorBannerProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mx-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <Package className="w-4 h-4 text-red-600" />
          </div>
        </div>
        <div className="ml-4">
          <h4 className="text-sm font-semibold text-red-800 mb-1">
            Connection Error
          </h4>
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-2 text-sm text-red-800 underline hover:text-red-900"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
