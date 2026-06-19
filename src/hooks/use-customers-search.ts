"use client";

import { useState, useMemo, useCallback } from "react";
import type { Customer } from "@/lib/types";
import type { FieldDefinition } from "@/lib/field-definitions";
import { isCustomerBuiltIn } from "@/lib/customer-field-definitions";

export function useCustomersSearch(customers: Customer[], fields: FieldDefinition[]) {
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

  const filteredCustomers = useMemo(() => {
    let result = customers;

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((c) =>
        [c.name, c.email, c.phone, c.company, c.industry].some((v) =>
          v?.toLowerCase().includes(q)
        )
      );
    }

    Object.entries(fieldFilters).forEach(([fieldId, filterVal]) => {
      if (!filterVal) return;
      const field = fields.find((f) => f.id === fieldId);
      const useContains = field?.type === "text" || field?.type === "textarea";
      result = result.filter((c) => {
        const val = isCustomerBuiltIn(fieldId)
          ? String((c as unknown as Record<string, unknown>)[fieldId] ?? "")
          : String(((c as unknown as Record<string, unknown>).customFields as Record<string, unknown> | undefined)?.[fieldId] ?? "");
        if (useContains) return val.toLowerCase().includes(filterVal.toLowerCase());
        return val === filterVal;
      });
    });

    return result;
  }, [customers, searchText, fieldFilters]);

  const activeFilterCount =
    Object.values(fieldFilters).filter(Boolean).length + (searchText ? 1 : 0);

  return {
    searchText, setSearchText,
    fieldFilters, setFilter, clearFilter, clearAll, applyFilters,
    filteredCustomers, activeFilterCount,
  };
}
