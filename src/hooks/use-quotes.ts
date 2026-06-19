"use client";

import { useState, useEffect, useCallback } from "react";
import type { Quote } from "@/lib/types";
import { mockQuotes } from "@/lib/mock-data";
import { logActivity } from "@/hooks/use-activity-log";

const STORAGE_KEY = "crm-quotes";

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setQuotes(JSON.parse(saved));
    } catch { localStorage.removeItem(STORAGE_KEY); }
  }, []);

  const persist = useCallback((updated: Quote[]) => {
    setQuotes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addQuote = useCallback(
    (q: Quote) => {
      persist([q, ...quotes]);
      logActivity("create", "quote", q.id, q.quoteNumber || q.customerName);
    },
    [quotes, persist]
  );

  const updateQuote = useCallback(
    (id: string, data: Partial<Quote>) => {
      const prev = quotes.find((q) => q.id === id);
      const now = new Date().toISOString();
      persist(
        quotes.map((q) =>
          q.id === id ? { ...q, ...data, updatedAt: now, updatedBy: "×× ×™" } : q
        )
      );
      if (prev) {
        const entityName = prev.quoteNumber || prev.customerName;
        if (data.status && data.status !== prev.status) {
          logActivity("status_change", "quote", id, entityName, undefined, { status: { from: prev.status, to: data.status } });
        } else {
          const changes = Object.keys(data).filter(
            (k) => (data as unknown as Record<string, unknown>)[k] !== (prev as unknown as Record<string, unknown>)[k]
          );
          logActivity("update", "quote", id, entityName, changes.join(", "));
        }
      }
    },
    [quotes, persist]
  );

  const deleteQuote = useCallback(
    (id: string) => {
      const prev = quotes.find((q) => q.id === id);
      persist(quotes.filter((q) => q.id !== id));
      if (prev) {
        logActivity("delete", "quote", id, prev.quoteNumber || prev.customerName);
      }
    },
    [quotes, persist]
  );

  const nextSerial = useCallback(
    () => Math.max(0, ...quotes.map((q) => q.serialNumber)) + 1,
    [quotes]
  );

  const getQuoteById = useCallback(
    (id: string) => quotes.find((q) => q.id === id) ?? null,
    [quotes]
  );

  return { quotes, addQuote, updateQuote, deleteQuote, nextSerial, getQuoteById };
}
