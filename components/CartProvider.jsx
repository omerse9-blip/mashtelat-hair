"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "mashtela_cart_v1";

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* התעלמות */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* התעלמות */ }
  }, [items, ready]);

  const addItem = useCallback((item, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x.key === item.key);
      if (i !== -1) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + qty };
        return next;
      }
      return [...prev, { ...item, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((x) => x.key !== key));
  }, []);

  const setQuantity = useCallback((key, qty) => {
    setItems((prev) => prev.map((x) => x.key === key ? { ...x, quantity: Math.max(1, qty) } : x));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, x) => s + x.quantity, 0);
  const total = items.reduce((s, x) => s + Number(x.price) * x.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQuantity, clear, count, total, ready }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
