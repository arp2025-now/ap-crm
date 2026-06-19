"use client";

import { useState, useEffect, useCallback } from "react";
import type { FieldDefinition, FieldOption } from "@/lib/field-definitions";
import { QUOTE_DEFAULT_FIELD_DEFINITIONS } from "@/lib/quote-field-definitions";

const STORAGE_KEY = "crm-quote-fields";

export function useQuoteFields() {
  const [fields, setFields] = useState<FieldDefinition[]>(QUOTE_DEFAULT_FIELD_DEFINITIONS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setFields(JSON.parse(saved));
    } catch { localStorage.removeItem(STORAGE_KEY); }
  }, []);

  const persist = useCallback((updated: FieldDefinition[]) => {
    setFields(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addField = useCallback(
    (data: { name: string; type: FieldDefinition["type"]; options?: FieldOption[] }) => {
      const maxOrder = fields.reduce((m, f) => Math.max(m, f.order), 0);
      persist([...fields, {
        id: `quotef_${Date.now()}`,
        name: data.name,
        type: data.type,
        options: data.options,
        required: false,
        isSystem: false,
        order: maxOrder + 1,
      }]);
    },
    [fields, persist]
  );

  const updateField = useCallback(
    (id: string, updates: Partial<FieldDefinition>) => {
      persist(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    },
    [fields, persist]
  );

  const deleteField = useCallback(
    (id: string) => {
      const f = fields.find((fld) => fld.id === id);
      if (!f || f.isSystem) return;
      persist(fields.filter((fld) => fld.id !== id));
    },
    [fields, persist]
  );

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);
  return { fields: sortedFields, addField, updateField, deleteField };
}
