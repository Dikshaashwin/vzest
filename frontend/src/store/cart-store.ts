"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  variantId: string;
  name: string;
  variantLabel: string;
  price: number;
  image?: string;
  quantity: number;
  maxStock: number;
};

type Coupon = { code: string; discount: number };

type CartState = {
  lines: CartLine[];
  coupon: Coupon | null;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  setCoupon: (coupon: Coupon | null) => void;
  clear: () => void;
  subtotal: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      addItem: (line, quantity = 1) => {
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === line.variantId);
          if (existing) {
            const nextQty = Math.min(existing.quantity + quantity, existing.maxStock);
            return {
              lines: state.lines.map((l) =>
                l.variantId === line.variantId ? { ...l, quantity: nextQty } : l
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity: Math.min(quantity, line.maxStock) }] };
        });
      },
      removeItem: (variantId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.variantId !== variantId) })),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          lines: state.lines.map((l) =>
            l.variantId === variantId ? { ...l, quantity: Math.max(1, Math.min(quantity, l.maxStock)) } : l
          ),
        })),
      setCoupon: (coupon) => set({ coupon }),
      clear: () => set({ lines: [], coupon: null }),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      itemCount: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    { name: "zest-cart" }
  )
);
