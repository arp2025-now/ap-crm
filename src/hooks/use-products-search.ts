"use client";

import { useState, useMemo, useCallback } from "react";
import type { Product } from "@/lib/types";
import type { FieldDefinition } from "@/lib/field-definitions";
import { isProductBuiltIn } from "@/lib/product-field-definitions";

export function useProductsSearch(products: Product[], fields: FieldDefinition[]) {
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

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((p) =>
        [p.name, p.description, p.sku, p.category].some((v) =>
          v?.toLowerCase().includes(q)
        )
      );
    }

    Object.entries(fieldFilters).forEach(([fieldId, filterVal]) => {
      if (!filterVal) return;
      const field = fields.find((f) => f.id === fieldId);
      const useContains = field?.type === "text" || field?.type === "textarea";
      result = result.filter((p) => {
        const val = isProductBuiltIn(fieldId)
          ? String((p as unknown as Record<string, unknown>)[fieldId] ?? "")
          : String(p.customFields?.[fieldId] ?? "");
        if (useContains) return val.toLowerCase().includes(filterVal.toLowerCase());
        return val === filterVal;
      });
    });

    return result;
  }, [products, searchText, fieldFilters, fields]);

  const activeFilterCount =
    Object.values(fieldFilters).filter(Boolean).length + (searchText ? 1 : 0);

  return {
    searchText, setSearchText,
    fieldFilters, setFilter, clearFilter, clearAll, applyFilters,
    filteredProducts, activeFilterCount,
  };
}
