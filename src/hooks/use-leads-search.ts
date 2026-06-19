"use client";

import { useState, useMemo, useCallback } from "react";
import type { Lead } from "@/lib/types";
import type { FieldDefinition } from "@/lib/field-definitions";
import { isBuiltIn } from "@/lib/field-definitions";

export function useLeadsSearch(leads: Lead[], fields: FieldDefinition[]) {
  const [searchText, setSearchText] = useState("");
  const [fieldFilters, setFieldFilters] = useState<Record<string, string>>({});

  const setFilter = useCallback((fieldId: string, value: string) => {
    setFieldFilters((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const clearFilter = useCallback((fieldId: string) => {
    setFieldFilters((prev) => {
      const next = { ...prev };
      delete next[fieldId];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSearchText("");
    setFieldFilters({});
  }, []);

  const applyFilters = useCallback((text: string, filters: Record<string, string>) => {
    setSearchText(text);
    setFieldFilters(filters);
  }, []);

  const filteredLeads = useMemo(() => {
    let result = leads;

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      result = result.filter((l) =>
        [l.customerName, l.customerEmail, l.phone, l.company].some((v) =>
          v?.toLowerCase().includes(q)
        )
      );
    }

    Object.entries(fieldFilters).forEach(([fieldId, filterVal]) => {
      if (!filterVal) return;
      const field = fields.find((f) => f.id === fieldId);
      const useContains = field?.type === "text" || field?.type === "textarea";
      result = result.filter((l) => {
        const val = isBuiltIn(fieldId)
          ? String((l as unknown as Record<string, unknown>)[fieldId] ?? "")
          : String(l.customFields?.[fieldId] ?? "");
        if (useContains) return val.toLowerCase().includes(filterVal.toLowerCase());
        return val === filterVal;
      });
    });

    return result;
  }, [leads, searchText, fieldFilters]);

  const activeFilterCount =
    Object.values(fieldFilters).filter(Boolean).length + (searchText ? 1 : 0);

  return {
    searchText, setSearchText,
    fieldFilters, setFilter, clearFilter, clearAll, applyFilters,
    filteredLeads, activeFilterCount,
  };
}
