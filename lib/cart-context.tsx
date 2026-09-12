/**
 * Cart state management (client-side)
 * Persists to localStorage, provides add/remove/update/clear operations
 */
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// ─── Types ────────────────────────────────────────────────

export interface CartCustomization {
  placement?: string;
  logoName?: string;
  logoPreview?: string;
  rotation?: number;
  size?: number;
  position?: { x: number; y: number };
}

export interface CartItem {
  id: number | string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  color?: string;
  size?: string;
  customization?: CartCustomization;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (id: number | string) => void;
  updateQuantity: (id: number | string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

// ─── Context ──────────────────────────────────────────────

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = "mpss_cart_v1";

// ─── Provider ─────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount (avoids SSR mismatch)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore parse errors */ }
    setHydrated(true);
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  /** Add an item to the cart, merging with existing if same id/color/size */
  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const match = prev.find(
        (i) =>
          i.id === item.id &&
          (i.color ?? "") === (item.color ?? "") &&
          (i.size ?? "") === (item.size ?? "")
      );
      if (match) {
        return prev.map((i) =>
          i === match ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  /** Remove an item by id */
  const removeItem = (id: number | string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  /** Update the quantity of an item (minimum 1) */
  const updateQuantity = (id: number | string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i))
    );
  };

  /** Clear the entire cart */
  const clearCart = () => setItems([]);

  // Derived totals
  const { totalItems, totalPrice } = useMemo(() => {
    const tItems = items.reduce((sum, i) => sum + i.quantity, 0);
    const tPrice = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    return { totalItems: tItems, totalPrice: tPrice };
  }, [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────

/** Access cart state — must be used within CartProvider */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    console.warn("useCart called without CartProvider — returning empty cart");
    return {
      items: [],
      addItem: () => {},
      removeItem: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      totalItems: 0,
      totalPrice: 0,
    };
  }
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────

/** Format a number as Indian Rupees */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
