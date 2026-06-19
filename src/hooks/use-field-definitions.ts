"use client";

import { useState, useEffect, useCallback } from "react";
import type { FieldDefinition, FieldOption } from "@/lib/field-definitions";
import { DEFAULT_FIELDS } from "@/lib/field-definitions";

const STORAGE_KEY = "crm-field-definitions";

export function useFieldDefinitions() {
  const [fields, setFields] = useState<FieldDefinition[]>(DEFAULT_FIELDS);

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
      const newField: FieldDefinition = {
        id: `custom_${Date.now()}`,
        name: data.name,
        type: data.type,
        options: data.options,
        required: false,
        isSystem: false,
        order: maxOrder + 1,
      };
      persist([...fields, newField]);
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
      const field = fields.find((f) => f.id === id);
      if (!field || field.isSystem) return;
      persist(fields.filter((f) => f.id !== id));
    },
    [fields, persist]
  );

  const reorderFields = useCallback(
    (reordered: FieldDefinition[]) => {
      persist(reordered.map((f, i) => ({ ...f, order: i })));
    },
    [persist]
  );

  const sortedFields = [...fields].sort((a, b) => a.order - b.order);

  return { fields: sortedFields, addField, updateField, deleteField, reorderFields };
}
