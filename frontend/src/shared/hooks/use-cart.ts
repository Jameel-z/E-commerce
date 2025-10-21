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
    quantity: number,
    product?: ProductDetail
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
        product:
          product ||
          ({
            id: productId,
            name: name,
            price: price.toString(), // Ensure price is stored as string to match ProductDetail
            description: null,
            stock_quantity: 0,
            category_id: 0,
            primary_image_url: null,
            category: { id: 0, name: "", created_at: "", updated_at: null },
            images: [],
            created_at: new Date().toISOString(),
            updated_at: null,
          } as ProductDetail),
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
    console.log("Refreshing cart for user:", user?.email || "guest");
    setLoading(true);
    try {
      if (user) {
        // User is logged in, fetch from API
        // Add small delay to ensure login process is complete
        await new Promise((resolve) => setTimeout(resolve, 100));
        console.log("Fetching user cart...");
        const userCart = await apiClient.getCart();
        setCart(userCart);
        console.log("User cart loaded:", userCart);
      } else {
        console.log("Loading guest cart...");
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
      // If user is logged in but cart fetch fails, still try to show empty user cart
      if (user) {
        setCart({
          items: [],
          total_price: 0,
          id: 0,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: null,
        });
      } else {
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
      }
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
        GuestCart.addItem(
          productId,
          product.name,
          Number(product.price),
          quantity,
          product
        );
        await refreshCart();
      } catch (error) {
        throw new Error("Failed to add item to cart");
      }
    }
  };

  // const updateQuantity = async (productId: number, quantity: number) => {
  //   if (user) {
  //     await apiClient.updateCartItem(productId, quantity);
  //     await refreshCart();
  //   } else {
  //     GuestCart.updateItem(productId, quantity);
  //     await refreshCart();
  //   }
  // };
  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (user) {
      // Find current quantity from cart
      const currentItem = cart?.items.find(
        (item) => item.product_id === productId
      );
      const currentQuantity = currentItem?.quantity || 0;

      await apiClient.updateCartItem(productId, newQuantity, currentQuantity);
      await refreshCart();
    } else {
      GuestCart.updateItem(productId, newQuantity);
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
