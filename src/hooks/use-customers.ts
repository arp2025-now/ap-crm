"use client";

import { useState, useEffect, useCallback } from "react";
import type { Customer } from "@/lib/types";
import { mockCustomers } from "@/lib/mock-data";
import { logActivity } from "@/hooks/use-activity-log";

const STORAGE_KEY = "crm-customers";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCustomers(JSON.parse(saved));
    } catch { localStorage.removeItem(STORAGE_KEY); }
  }, []);

  const persist = useCallback((updated: Customer[]) => {
    setCustomers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addCustomer = useCallback(
    (c: Customer) => {
      persist([c, ...customers]);
      logActivity("create", "customer", c.id, c.name);
    },
    [customers, persist]
  );

  const updateCustomer = useCallback(
    (id: string, data: Partial<Customer>) => {
      const now = new Date().toISOString();
      const prev = customers.find((c) => c.id === id);
      persist(
        customers.map((c) =>
          c.id === id ? { ...c, ...data, updatedAt: now, updatedBy: "אני" } : c
        )
      );
      if (prev) {
        const changes: Record<string, { from?: string | number | null; to?: string | number | null }> = {};
        for (const key of Object.keys(data) as (keyof Customer)[]) {
          if (key === "updatedAt" || key === "updatedBy") continue;
          if (prev[key] !== data[key]) changes[key] = { from: prev[key] as any, to: data[key] as any };
        }
        logActivity("update", "customer", id, prev.name, undefined, Object.keys(changes).length > 0 ? changes : undefined);
      }
    },
    [customers, persist]
  );

  const deleteCustomer = useCallback(
    (id: string) => {
      const prev = customers.find((c) => c.id === id);
      persist(customers.filter((c) => c.id !== id));
      if (prev) logActivity("delete", "customer", id, prev.name);
    },
    [customers, persist]
  );

  const nextSerial = useCallback(
    () => Math.max(0, ...customers.map((c) => c.serialNumber ?? 0)) + 1,
    [customers]
  );

  return { customers, addCustomer, updateCustomer, deleteCustomer, nextSerial };
}
