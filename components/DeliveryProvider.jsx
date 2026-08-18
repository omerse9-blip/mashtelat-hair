"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

const DeliveryContext = createContext(null);
const STORAGE_KEY = "mashtela_delivery_v1";
const EMPTY = { method: null, date: "", window: "", dateLabel: "", street: "", houseNumber: "" };

export function DeliveryProvider({ children }) {
  const [delivery, setDeliveryState] = useState(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDeliveryState({ ...EMPTY, ...JSON.parse(raw) });
    } catch { /* התעלמות */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(delivery)); } catch { /* התעלמות */ }
  }, [delivery, ready]);

  const setDelivery = useCallback((partial) => {
    setDeliveryState((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearDelivery = useCallback(() => setDeliveryState(EMPTY), []);

  const isComplete = !!delivery.method && !!delivery.date && !!delivery.window &&
    (delivery.method === "pickup" || (!!delivery.street && !!delivery.houseNumber));

  return (
    <DeliveryContext.Provider value={{ delivery, setDelivery, clearDelivery, ready, isComplete }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useDelivery must be used within DeliveryProvider");
  return ctx;
}
