// ========================================
// ORDER TYPE DEFINITIONS
// ========================================

/**
 * Order Item interface - matches backend schemas/order_item.py OrderItem
 */
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price_at_order: number;
  total_price: number;
}

/**
 * Order interface - matches backend schemas/order.py Order
 */
export interface Order {
  id: number;
  user_id: number;
  status: string;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
  order_items: OrderItem[];
}

/**
 * Create Order Request - matches backend expected format
 */
export interface CreateOrderRequest {
  cart_items: {
    product_id: number;
    quantity: number;
  }[];
  shipping_address: string;
  payment_method: string;
  notes?: string;
}
