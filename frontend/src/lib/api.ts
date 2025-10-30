// Auth types from feature folder
import type {
  User,
  AuthResponse,
  UserRegistrationRequest,
} from "@/features/auth/types";

// Cart types from feature folder
import type { CartItem, Cart } from "@/features/cart/types";

// Order types from feature folder
import type {
  OrderItem,
  Order,
  CreateOrderRequest,
} from "@/features/orders/types";

// Shared types (products, categories)
import type {
  Category,
  Product,
  ProductDetail,
  ProductImage,
  ProductCreateRequest,
} from "@/shared/types";

//  Image utilities
import { getImageUrl, getProductImageUrl } from "@/shared/utils/image";

// API configuration
import { API_BASE_URL } from "@/shared/constants/config";

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
   * Update current user profile - matches backend /users/me PATCH endpoint
   */
  async updateCurrentUser(data: {
    name?: string;
    password?: string;
  }): Promise<User> {
    return this.request<User>("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
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
  // async createProduct(
  //   productData: ProductCreateRequest
  // ): Promise<ProductDetail> {
  //   return this.request<ProductDetail>("/products/", {
  //     method: "POST",
  //     body: JSON.stringify(productData),
  //   });
  // }
  async createProduct(
    productData: ProductCreateRequest
  ): Promise<ProductDetail> {
    const formData = new FormData();

    // Required fields
    formData.append("name", productData.name);
    formData.append("price", productData.price.toString());
    formData.append(
      "stock_quantity",
      (productData.stock_quantity || 0).toString()
    );

    // Optional fields
    if (productData.description) {
      formData.append("description", productData.description);
    }

    // Only append category_id if it exists (following your login pattern)
    if (productData.category_id) {
      formData.append("category_id", productData.category_id.toString());
    }

    // Handle file uploads
    if (productData.primary_image) {
      formData.append("primary_image", productData.primary_image);
    }

    if (
      productData.secondary_images &&
      productData.secondary_images.length > 0
    ) {
      productData.secondary_images.forEach((file) => {
        formData.append("secondary_images", file);
      });
    }

    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/products/`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // No Content-Type - let browser handle FormData boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Update product - matches backend /products/{id} PUT endpoint (Admin only)
   */
  async updateProduct(
    id: number,
    productData: any // Change type to accept keep_image_ids and new_images
  ): Promise<ProductDetail> {
    const formData = new FormData();

    // Add basic fields
    if (productData.name) {
      formData.append("name", productData.name);
    }
    if (productData.price !== undefined) {
      formData.append("price", productData.price.toString());
    }
    if (productData.stock_quantity !== undefined) {
      formData.append("stock_quantity", productData.stock_quantity.toString());
    }
    if (productData.description) {
      formData.append("description", productData.description);
    }
    if (productData.category_id !== undefined) {
      formData.append("category_id", productData.category_id.toString());
    }

    // Handle primary image
    if (productData.primary_image) {
      formData.append("primary_image", productData.primary_image);
    }

    // 🔥 NEW: Handle keep_image_ids for existing images
    if (productData.keep_image_ids !== undefined) {
      formData.append("keep_image_ids", productData.keep_image_ids);
    }

    // 🔥 FIXED: Use "new_images" instead of "secondary_images"
    if (productData.new_images && productData.new_images.length > 0) {
      productData.new_images.forEach((file: File) => {
        formData.append("new_images", file); // ✅ Correct field name
      });
    }

    const token = localStorage.getItem("access_token");
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Delete product - matches backend /products/{id} DELETE endpoint (Admin only)
   */
  async deleteProduct(id: number): Promise<void> {
    const url = `${API_BASE_URL}/products/${id}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Failed to delete product: ${response.status}`);
    }

    // Don't try to parse JSON - DELETE returns empty response
    return;
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
    // Get guest cart from localStorage
    const guestCartData = localStorage.getItem("cart");

    if (!guestCartData) {
      // No guest cart to merge, just return empty response
      console.log("No guest cart found to merge");
      return this.getCart(); // Get user's existing cart instead
    }

    try {
      const guestCart = JSON.parse(guestCartData);

      // Transform localStorage cart format to backend format
      const mergeRequest = {
        items:
          guestCart.items?.map((item: any) => ({
            product_id: item.product_id || item.id,
            quantity: item.quantity,
          })) || [],
      };

      // Only merge if there are items
      if (mergeRequest.items.length === 0) {
        console.log("Guest cart is empty, skipping merge");
        return this.getCart();
      }

      console.log("Merging guest cart:", mergeRequest);

      const result = await this.request<Cart>("/carts/merge", {
        method: "POST",
        body: JSON.stringify(mergeRequest),
      });

      // Clear guest cart after successful merge
      localStorage.removeItem("cart");
      console.log("Guest cart merged and cleared");

      return result;
    } catch (error) {
      console.error("Failed to parse or merge guest cart:", error);
      // If merge fails, just get the user's existing cart
      return this.getCart();
    }
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

// ========================================
// RE-EXPORT TYPES FOR CONVENIENCE
// ========================================

// Auth types
export type {
  User,
  AuthResponse,
  UserRegistrationRequest,
} from "@/features/auth/types";

// Cart types
export type { CartItem, Cart } from "@/features/cart/types";

// Order types
export type {
  OrderItem,
  Order,
  CreateOrderRequest,
} from "@/features/orders/types";

// Shared types (products, categories)
export type {
  Category,
  Product,
  ProductDetail,
  ProductImage,
  ProductCreateRequest,
} from "@/shared/types";
