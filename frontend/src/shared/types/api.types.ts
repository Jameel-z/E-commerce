// ========================================
// SHARED TYPE DEFINITIONS - Aligned with Backend Schemas
// ========================================

/**
 * Category interface - matches backend schemas/category.py
 * Used across products and admin features
 */
export interface Category {
  id: number;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Product Image interface - matches backend schemas/product.py ProductImage
 */
export interface ProductImage {
  id: number;
  url: string;
  product_id: number;
  created_at: string;
}

/**
 * Product List interface - matches backend schemas/product.py ProductList
 * Used for product listings (main page, search results)
 */
export interface Product {
  id: number;
  name: string;
  price: number;
  primary_image_url: string | null;
  category_name: string;
  stock_quantity: number;
}

/**
 * Product Detail interface - matches backend schemas/product.py ProductDetail
 * Used for individual product pages
 */
export interface ProductDetail {
  id: number;
  name: string;
  description: string | null;
  price: string; // Backend returns price as string "100.00"
  stock_quantity: number;
  category_id: number;
  primary_image_url: string | null;
  category: Category;
  images: ProductImage[]; // Updated to match backend response
  created_at: string;
  updated_at: string | null;
}

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

/**
 * Product Creation Request - for admin use
 */
export interface ProductCreateRequest {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category_id?: number; // Make optional
  primary_image?: File;
  secondary_images?: File[];
}
