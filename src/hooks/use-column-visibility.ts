"use client";

import { useState, useEffect, useCallback } from "react";

export interface ColumnDef {
  id: string;
  label: string;
}

export const LEAD_COLUMNS: ColumnDef[] = [
  { id: "phone",         label: "טלפון" },
  { id: "company",       label: "חברה" },
  { id: "heatLevel",     label: "רמת חום" },
  { id: "status",        label: "סטטוס" },
  { id: "pipelineValue", label: "שווי עסקה משוער" },
  { id: "lastContact",   label: "קשר אחרון" },
];

const DEFAULT_VISIBLE = ["company", "heatLevel", "pipelineValue", "lastContact"];
const STORAGE_KEY = "crm-leads-columns";

export function useColumnVisibility() {
  const [visible, setVisible] = useState<string[]>(DEFAULT_VISIBLE);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setVisible(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const toggle = useCallback((id: string) => {
    setVisible((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isVisible = useCallback((id: string) => visible.includes(id), [visible]);

  return { visible, toggle, isVisible };
}
