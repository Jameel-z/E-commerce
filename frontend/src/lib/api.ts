const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Convert backend image path to full URL
 * @param imagePath - Relative path from backend
 * @returns Full URL or null if no path
 */
export const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_BASE_URL}${imagePath}`;
};

/**
 * Get product image URL with fallback placeholder
 * @param product - Product object with primary_image_url
 * @returns Image URL or SVG placeholder
 */
export const getProductImageUrl = (product: {
  primary_image_url: string | null;
}): string => {
  const primaryUrl = getImageUrl(product.primary_image_url);
  if (primaryUrl) return primaryUrl;

  // Return optimized SVG placeholder
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial, sans-serif' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
};

// ========================================
// TYPE DEFINITIONS - Aligned with Backend Schemas
// ========================================

/**
 * User interface - matches backend schemas/user.py User schema
 */
export interface User {
  id: number;
  name: string | null;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string | null;
}

/**
 * Category interface - matches backend schemas/category.py
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
  price: number;
  stock_quantity: number;
  category_id: number;
  primary_image_url: string | null;
  category: Category;
  secondary_images: ProductImage[];
  created_at: string;
  updated_at: string | null;
}

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

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

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

/**
 * User Registration Request
 */
export interface UserRegistrationRequest {
  name: string;
  email: string;
  password: string;
}

/**
 * Product Creation Request - for admin
 */
export interface ProductCreateRequest {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category_id: number;
}

/**
 * Authentication Response
 */
export interface AuthResponse {
  access_token: string;
  token_type: string;
}

// ========================================
// API CLIENT CLASS
// ========================================

class ApiClient {
  /**
   * Get authentication headers for API requests
   */
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Generic request method with error handling
   */
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ========================================
  // AUTHENTICATION APIS
  // ========================================

  /**
   * Login user - matches backend /users/token endpoint
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch(`${API_BASE_URL}/users/token`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Invalid credentials");
    }

    const data: AuthResponse = await response.json();
    localStorage.setItem("access_token", data.access_token);
    return data;
  }

  /**
   * Register new user - matches backend /users/ POST endpoint
   */
  async register(userData: UserRegistrationRequest): Promise<User> {
    return this.request<User>("/users/", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  /**
   * Get current user info - matches backend /users/me endpoint
   */
  async getCurrentUser(): Promise<User> {
    return this.request<User>("/users/me");
  }

  /**
   * Logout user (client-side token removal)
   */
  logout(): void {
    localStorage.removeItem("access_token");
  }

  // ========================================
  // PRODUCT APIS
  // ========================================

  /**
   * Get products list - matches backend /products/ GET endpoint
   * Returns ProductList items (for main page, category listings)
   */
  async getProducts(): Promise<Product[]> {
    return this.request<Product[]>("/products/");
  }

  /**
   * Get single product details - matches backend /products/{id} GET endpoint
   * Returns ProductDetail with full info including images
   */
  async getProduct(id: number): Promise<ProductDetail> {
    return this.request<ProductDetail>(`/products/${id}`);
  }

  /**
   * Create new product - matches backend /products/ POST endpoint (Admin only)
   */
  async createProduct(
    productData: ProductCreateRequest
  ): Promise<ProductDetail> {
    return this.request<ProductDetail>("/products/", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  /**
   * Update product - matches backend /products/{id} PUT endpoint (Admin only)
   */
  async updateProduct(
    id: number,
    productData: Partial<ProductCreateRequest>
  ): Promise<ProductDetail> {
    return this.request<ProductDetail>(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  /**
   * Delete product - matches backend /products/{id} DELETE endpoint (Admin only)
   */
  async deleteProduct(id: number): Promise<void> {
    return this.request(`/products/${id}`, {
      method: "DELETE",
    });
  }

  // ========================================
  // CATEGORY APIS
  // ========================================

  /**
   * Get all categories - matches backend /categories/ GET endpoint
   */
  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/categories/");
  }

  /**
   * Create category - matches backend /categories/ POST endpoint (Admin only)
   */
  async createCategory(name: string): Promise<Category> {
    return this.request<Category>("/categories/", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  /**
   * Delete category - matches backend /categories/{id} DELETE endpoint (Admin only)
   */
  async deleteCategory(id: number): Promise<void> {
    return this.request(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  // ========================================
  // CART APIS
  // ========================================

  /**
   * Get user's cart - matches backend /carts/my-cart GET endpoint
   */
  async getCart(): Promise<Cart> {
    return this.request<Cart>("/carts/my-cart");
  }

  /**
   * Add item to cart - matches backend /carts/add-item POST endpoint
   */
  async addToCart(product_id: number, quantity: number): Promise<Cart> {
    return this.request<Cart>("/carts/add-item", {
      method: "POST",
      body: JSON.stringify({ product_id, quantity }),
    });
  }

  /**
   * Update cart item quantity - matches backend /carts/update-item PATCH endpoint
   */
  async updateCartItem(product_id: number, quantity: number): Promise<Cart> {
    return this.request<Cart>("/carts/update-item", {
      method: "PATCH",
      body: JSON.stringify({ product_id, quantity }),
    });
  }

  /**
   * Remove item from cart - matches backend /carts/remove-item/{product_id} DELETE endpoint
   */
  async removeFromCart(product_id: number): Promise<Cart> {
    return this.request<Cart>(`/carts/remove-item/${product_id}`, {
      method: "DELETE",
    });
  }

  /**
   * Clear entire cart - matches backend /carts/clear DELETE endpoint
   */
  async clearCart(): Promise<void> {
    return this.request("/carts/clear", {
      method: "DELETE",
    });
  }

  /**
   * Merge guest cart with user cart - matches backend /carts/merge POST endpoint
   */
  async mergeCart(): Promise<Cart> {
    return this.request<Cart>("/carts/merge", {
      method: "POST",
    });
  }

  // ========================================
  // ORDER APIS
  // ========================================

  /**
   * Create new order - matches backend /orders/ POST endpoint
   */
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    return this.request<Order>("/orders/", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  /**
   * Get user's orders - matches backend /orders/ GET endpoint
   */
  async getOrders(): Promise<Order[]> {
    return this.request<Order[]>("/orders/");
  }

  /**
   * Get specific order - matches backend /orders/{id} GET endpoint
   */
  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  /**
   * Update order status - matches backend /orders/{id} PATCH endpoint (Admin only)
   */
  async updateOrderStatus(id: number, status: string): Promise<Order> {
    return this.request<Order>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Get all orders - matches backend /admin/orders/ GET endpoint (Admin only)
   */
  async getAllOrders(): Promise<Order[]> {
    return this.request<Order[]>("/admin/orders/");
  }
}

// ========================================
// EXPORT API CLIENT INSTANCE
// ========================================

/**
 * Singleton API client instance for use throughout the application
 */
export const apiClient = new ApiClient();
