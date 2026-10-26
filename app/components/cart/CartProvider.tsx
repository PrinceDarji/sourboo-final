'use client';

import { normalizeCart, normalizeCartItem, type CartItem } from '@/src/lib/cart/normalize';
export type { CartItem } from '@/src/lib/cart/normalize';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  calculateDiscountRupees,
  POPUP_DISCOUNT_PERCENT,
  resolveDiscountCode,
} from '@/src/lib/checkout/discountCodes';

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  discountCode: string | null;
  discountAmount: number;
  discountPercent: number;
  subtotalAfterDiscount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  updateQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clearCart: () => void;
  applyDiscountCode: (value: string) => { ok: true; code: string } | { ok: false; error: string };
  clearDiscountCode: () => void;
};

const STORAGE_KEY = 'sourboo_cart_v2';
const DISCOUNT_CODE_STORAGE_KEY = 'sourboo_cart_discount_code_v1';

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(normalizeCart(parsed));
        }
      }

      const rawDiscountCode = window.localStorage.getItem(DISCOUNT_CODE_STORAGE_KEY);
      setDiscountCode(resolveDiscountCode(rawDiscountCode));
    } catch {
      // ignore malformed storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {
      // Storage may be disabled or full; the in-memory cart still works.
    }
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    try {
      if (discountCode) window.localStorage.setItem(DISCOUNT_CODE_STORAGE_KEY, discountCode);
      else window.localStorage.removeItem(DISCOUNT_CODE_STORAGE_KEY);
    } catch {
      // Keep the active discount in memory when storage is unavailable.
    }
  }, [discountCode, hydrated]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const normalized = normalizeCartItem({ ...item, quantity });
      if (!normalized) return prev;
      item = normalized;
      quantity = normalized.quantity;
      const existing = prev.find((cartItem) => cartItem.slug === item.slug);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.slug === item.slug
            ? {
                ...cartItem,
                name: item.name,
                image: item.image,
                price: Math.max(0, Number(item.price) || 0),
                quantity: Math.min(99, cartItem.quantity + Math.max(1, quantity)),
              }
            : cartItem,
        );
      }
      return [
        ...prev,
        {
          ...item,
          price: Math.max(0, Number(item.price) || 0),
          quantity: Math.max(1, quantity),
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((slug: string, quantity: number) => {
    if (!Number.isFinite(quantity)) return;
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.slug !== slug));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.slug === slug ? { ...item, quantity: Math.min(99, Math.max(1, Math.floor(quantity))) } : item)),
    );
  }, []);

  const removeItem = useCallback((slug: string) => {
    setItems((prev) => prev.filter((item) => item.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const clearDiscountCode = useCallback(() => setDiscountCode(null), []);

  const applyDiscountCode = useCallback((value: string) => {
    const resolvedCode = resolveDiscountCode(value);

    if (!resolvedCode) {
      return { ok: false as const, error: 'Enter a valid discount code.' };
    }

    setDiscountCode(resolvedCode);
    return { ok: true as const, code: resolvedCode };
  }, []);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = calculateDiscountRupees(subtotal, discountCode);
    const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount);

    return {
      items,
      totalItems,
      subtotal,
      discountCode,
      discountAmount,
      discountPercent: discountCode ? POPUP_DISCOUNT_PERCENT : 0,
      subtotalAfterDiscount,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyDiscountCode,
      clearDiscountCode,
    };
  }, [
    items,
    discountCode,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyDiscountCode,
    clearDiscountCode,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
