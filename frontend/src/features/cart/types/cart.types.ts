import { ProductDetail } from "@/shared/types/api.types";

/**
 * Cart Item interface - matches backend schemas/cart.py CartItem
 */
export interface CartItem {
  price: number;
  id: number;
  product_id: number;
  quantity: number;
  product: ProductDetail;
  added_at: string;
  updated_at: string | null;
  total_price: number; // Add this property
}

/**
 * Cart interface - matches backend schemas/cart.py Cart
 */
export interface Cart {
  id: number;
  user_id: number | null;
  items: CartItem[];
  total_price: number;
  created_at: string;
  updated_at: string | null;
}

// ========================================
// CART PAGE TYPES
// ========================================

// Cart page specific state
export interface CartPageState {
  isLoading: boolean;
  error: string | null;
  isClearing: boolean;
}

// Cart item operations
export interface CartItemOperations {
  onUpdateQuantity: (productId: number, quantity: number) => Promise<void>;
  onRemoveItem: (productId: number) => Promise<void>;
  isUpdating?: boolean;
  isRemoving?: boolean;
}

// Cart summary calculations
export interface CartSummaryData {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
}
