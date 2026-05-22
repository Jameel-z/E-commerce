"use client";
import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/shared/components/ui";
import { getImageUrl, getProductImageUrl } from "@/shared/utils";
import { type ProductDetail } from "@/lib/api";
import { ZoomIn, ZoomOut } from "lucide-react";

interface ProductImageGalleryProps {
  product: ProductDetail;
  className?: string;
}

export function ProductImageGallery({
  product,
  className = "",
}: ProductImageGalleryProps) {
  // Create array of all images (primary + secondary)
  const allImages = [
    // Primary image first
    {
      id: "primary",
      url: product.primary_image_url,
      isPrimary: true,
    },
    // Then secondary images
    ...(product.images || []).map((img) => ({
      id: img.id,
      url: img.url,
      isPrimary: false,
    })),
  ].filter((img) => img.url); // Remove any null URLs

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const selectedImage = allImages[selectedImageIndex];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
    if (!isZoomed) {
      setZoomPosition({ x: 50, y: 50 }); // Reset to center when enabling zoom
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Display Image */}
      <div className="relative">
        <div
          className={`
            relative overflow-hidden rounded-lg bg-white border group max-h-[260px] sm:max-h-[340px] lg:max-h-[420px]
            ${isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"}
          `}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomPosition({ x: 50, y: 50 })}
          onClick={toggleZoom}
        >
          <Image
            src={selectedImage?.url || "/placeholder.svg"}
            alt={product.name}
            width={600}
            height={400}
            className={`
              w-full h-auto max-h-[260px] sm:max-h-[340px] lg:max-h-[420px] object-contain transition-all duration-300
              ${isZoomed ? "scale-[2.5]" : "group-hover:scale-105"}
            `}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }
                : {}
            }
            priority
          />

          {/* Stock Status Badges */}
          {product.stock_quantity === 0 && (
            <Badge
              variant="destructive"
              className="absolute top-4 right-4 z-10"
            >
              Out of Stock
            </Badge>
          )}
          {product.stock_quantity > 0 && product.stock_quantity <= 2 && (
            <Badge variant="secondary" className="absolute top-4 right-4 z-10">
              Low Stock
            </Badge>
          )}

          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleZoom();
              }}
              className="bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-colors duration-200"
              title={isZoomed ? "Zoom Out" : "Zoom In"}
            >
              {isZoomed ? (
                <ZoomOut className="h-4 w-4" />
              ) : (
                <ZoomIn className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Image Counter */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-2 py-1 rounded text-sm z-10">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Zoom Indicator */}
          {isZoomed && (
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-2 py-1 rounded text-xs z-10">
              2.5x Zoom
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {allImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => {
                setSelectedImageIndex(index);
                setIsZoomed(false); // Reset zoom when changing images
              }}
              className={`
                aspect-square relative overflow-hidden rounded-md bg-muted
                border-2 transition-all duration-200 hover:opacity-80 hover:scale-[1.02]
                ${
                  index === selectedImageIndex
                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                    : "border-transparent hover:border-muted-foreground/30"
                }
              `}
            >
              <Image
                src={image.url || "/placeholder.svg"}
                alt={`${product.name} - View ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Active indicator overlay */}
              {index === selectedImageIndex && (
                <div className="absolute inset-0 bg-primary/10" />
              )}

              {/* Primary image indicator */}
              {image.isPrimary && (
                <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                  Main
                </div>
              )}

              {/* Selected indicator */}
              {index === selectedImageIndex && (
                <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full w-2 h-2" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* No additional images message */}
      {allImages.length === 1 && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            Single image available
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Click image to zoom
          </p>
        </div>
      )}

      {/* Zoom instructions — desktop only (mouse-specific) */}
      {allImages.length > 0 && (
        <div className="hidden sm:block text-center">
          <p className="text-xs text-muted-foreground">
            {isZoomed
              ? "Move mouse to pan • Click to zoom out"
              : "Click image to zoom in • Click thumbnails to switch"}
          </p>
        </div>
      )}
    </div>
  );
}
