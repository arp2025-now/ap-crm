"use client";

import { useState, useMemo, useCallback } from "react";
import type { Quote } from "@/lib/types";
import type { FieldDefinition } from "@/lib/field-definitions";
import { isQuoteBuiltIn } from "@/lib/quote-field-definitions";

export function useQuotesSearch(quotes: Quote[], fields: FieldDefinition[]) {
  const [searchText, setSearchText] = useState("");
  const [fieldFilters, setFieldFilters] = useState<Record<string, string>>({});

  const setFilter = useCallback((fieldId: string, value: string) => {
    setFieldFilters((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const clearFilter = useCallback((fieldId: string) => {
    setFieldFilters((prev) => { const n = { ...prev }; delete n[fieldId]; return n; });
  }, []);

  const clearAll = useCallback(() => {
    setSearchText("");
    setFieldFilters({});
  }, []);

  const applyFilters = useCallback((text: string, filters: Record<string, string>) => {
    setSearchText(text);
    setFieldFilters(filters);
  }, []);

  const filteredQuotes = useMemo(() => {
    let result = quotes;

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((qt) =>
        [qt.quoteNumber, qt.customerName].some((v) =>
          v?.toLowerCase().includes(q)
        )
      );
    }

    Object.entries(fieldFilters).forEach(([fieldId, filterVal]) => {
      if (!filterVal) return;
      const field = fields.find((f) => f.id === fieldId);
      const useContains = field?.type === "text" || field?.type === "textarea";
      result = result.filter((qt) => {
        const val = isQuoteBuiltIn(fieldId)
          ? String((qt as unknown as Record<string, unknown>)[fieldId] ?? "")
          : String(qt.customFields?.[fieldId] ?? "");
        if (useContains) return val.toLowerCase().includes(filterVal.toLowerCase());
        return val === filterVal;
      });
    });

    return result;
  }, [quotes, searchText, fieldFilters, fields]);

  const activeFilterCount =
    Object.values(fieldFilters).filter(Boolean).length + (searchText ? 1 : 0);

  return {
    searchText, setSearchText,
    fieldFilters, setFilter, clearFilter, clearAll, applyFilters,
    filteredQuotes, activeFilterCount,
  };
}
