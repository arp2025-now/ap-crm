"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product } from "@/lib/types";
import { mockProducts } from "@/lib/mock-data";

const STORAGE_KEY = "crm-products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(mockProducts);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProducts(JSON.parse(saved));
    } catch { localStorage.removeItem(STORAGE_KEY); }
  }, []);

  const persist = useCallback((updated: Product[]) => {
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addProduct = useCallback(
    (p: Product) => persist([p, ...products]),
    [products, persist]
  );

  const updateProduct = useCallback(
    (id: string, data: Partial<Product>) => {
      const now = new Date().toISOString();
      persist(
        products.map((p) =>
          p.id === id ? { ...p, ...data, updatedAt: now, updatedBy: "אני" } : p
        )
      );
    },
    [products, persist]
  );

  const deleteProduct = useCallback(
    (id: string) => persist(products.filter((p) => p.id !== id)),
    [products, persist]
  );

  const nextSerial = useCallback(
    () => Math.max(0, ...products.map((p) => p.serialNumber)) + 1,
    [products]
  );

  return { products, addProduct, updateProduct, deleteProduct, nextSerial };
}
