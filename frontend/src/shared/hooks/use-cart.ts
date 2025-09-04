"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { apiClient, ProductDetail, type Cart, type CartItem } from "@/lib/api";
import { useAuth } from "@/shared/hooks/use-auth";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Guest cart management using localStorage
class GuestCart {
  private static STORAGE_KEY = "guest_cart";

  static getCart(): CartItem[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static setCart(items: CartItem[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  }

  static addItem(
    productId: number,
    name: string,
    price: number,
    quantity: number
  ): void {
    const items = this.getCart();
    const existingItem = items.find((item) => item.product_id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.total_price = existingItem.quantity * existingItem.price;
    } else {
      items.push({
        id: Date.now(), // Generate a temporary ID for guest cart
        product_id: productId,
        price,
        quantity,
        total_price: price * quantity,
        product: {
          id: productId,
          name: name,
          // Add other required ProductDetail properties or use minimal structure
        } as ProductDetail,
        added_at: new Date().toISOString(),
        updated_at: null,
      });
    }

    this.setCart(items);
  }

  static updateItem(productId: number, quantity: number): void {
    const items = this.getCart();
    const item = items.find((item) => item.product_id === productId);

    if (item) {
      item.quantity = quantity;
      item.total_price = item.quantity * item.price;
      this.setCart(items);
    }
  }

  static removeItem(productId: number): void {
    const items = this.getCart().filter(
      (item) => item.product_id !== productId
    );
    this.setCart(items);
  }

  static clear(): void {
    this.setCart([]);
  }

  static getTotal(): number {
    return this.getCart().reduce((total, item) => total + item.total_price, 0);
  }
}

export function useCartProvider() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const refreshCart = async () => {
    setLoading(true);
    try {
      if (user) {
        // User is logged in, fetch from API
        const userCart = await apiClient.getCart();
        setCart(userCart);
      } else {
        // Guest user, use localStorage
        const guestItems = GuestCart.getCart();
        setCart({
          items: guestItems,
          total_price: GuestCart.getTotal(),
          id: 0,
          user_id: null,
          created_at: new Date().toISOString(),
          updated_at: null,
        });
      }
    } catch (error) {
      console.error("Failed to refresh cart:", error);
      // Fallback to guest cart
      const guestItems = GuestCart.getCart();
      setCart({
        items: guestItems,
        total_price: GuestCart.getTotal(),
        id: 0,
        user_id: null,
        created_at: new Date().toISOString(),
        updated_at: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [user]);

  const addToCart = async (productId: number, quantity: number) => {
    if (user) {
      // User is logged in, use API
      await apiClient.addToCart(productId, quantity);
      await refreshCart();
    } else {
      // Guest user, use localStorage
      // We need to get product details for guest cart
      try {
        const product = await apiClient.getProduct(productId);
        GuestCart.addItem(productId, product.name, product.price, quantity);
        await refreshCart();
      } catch (error) {
        throw new Error("Failed to add item to cart");
      }
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (user) {
      await apiClient.updateCartItem(productId, quantity);
      await refreshCart();
    } else {
      GuestCart.updateItem(productId, quantity);
      await refreshCart();
    }
  };

  const removeItem = async (productId: number) => {
    if (user) {
      await apiClient.removeFromCart(productId);
      await refreshCart();
    } else {
      GuestCart.removeItem(productId);
      await refreshCart();
    }
  };

  const clearCart = async () => {
    if (user) {
      await apiClient.clearCart();
      await refreshCart();
    } else {
      GuestCart.clear();
      await refreshCart();
    }
  };

  const itemCount =
    cart?.items.reduce((count, item) => count + item.quantity, 0) || 0;

  return {
    cart,
    loading,
    itemCount,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };
}

export { CartContext };
