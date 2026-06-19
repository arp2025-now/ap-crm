"use client";

import { useState, useEffect, useCallback } from "react";
import type { QuoteSectionTemplate, QuoteSection } from "@/lib/types";

const STORAGE_KEY = "crm-section-templates";

const DEFAULT_TEMPLATES: QuoteSectionTemplate[] = [
  {
    id: "tpl-default",
    name: "תבנית בסיסית",
    sections: [
      { title: "הערות", content: "" },
      { title: "תנאי תשלום", content: "תשלום תוך 30 יום מתאריך ההצעה" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "tpl-full",
    name: "תבנית מלאה",
    sections: [
      { title: "תיאור הפרויקט", content: "" },
      { title: "היקף העבודה", content: "" },
      { title: "לוח זמנים", content: "" },
      { title: "תנאי תשלום", content: "תשלום תוך 30 יום מתאריך ההצעה" },
      { title: "הערות", content: "" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function useSectionTemplates() {
  const [templates, setTemplates] = useState<QuoteSectionTemplate[]>(DEFAULT_TEMPLATES);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTemplates(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = useCallback((updated: QuoteSectionTemplate[]) => {
    setTemplates(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addTemplate = useCallback(
    (name: string, sections: QuoteSection[]) => {
      const now = new Date().toISOString();
      const tpl: QuoteSectionTemplate = {
        id: `tpl-${Date.now()}`,
        name,
        sections: sections.map(({ title, content }) => ({ title, content })),
        createdAt: now,
        updatedAt: now,
      };
      persist([tpl, ...templates]);
      return tpl;
    },
    [templates, persist]
  );

  const updateTemplate = useCallback(
    (id: string, data: Partial<Pick<QuoteSectionTemplate, "name" | "sections">>) => {
      persist(
        templates.map((t) =>
          t.id === id
            ? {
                ...t,
                ...data,
                sections: data.sections
                  ? data.sections.map(({ title, content }) => ({ title, content }))
                  : t.sections,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );
    },
    [templates, persist]
  );

  const deleteTemplate = useCallback(
    (id: string) => persist(templates.filter((t) => t.id !== id)),
    [templates, persist]
  );

  const applyTemplate = useCallback(
    (templateId: string): QuoteSection[] => {
      const tpl = templates.find((t) => t.id === templateId);
      if (!tpl) return [];
      return tpl.sections.map((s, i) => ({
        id: `sec-${Date.now()}-${i}`,
        title: s.title,
        content: s.content,
        order: i,
      }));
    },
    [templates]
  );

  return { templates, addTemplate, updateTemplate, deleteTemplate, applyTemplate };
}
