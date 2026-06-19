"use client";

import { useState, useEffect, useCallback } from "react";
import type { WebForm, WebFormResponse } from "@/lib/types";
import { logActivity } from "@/hooks/use-activity-log";

const FORMS_KEY = "crm-forms";
const RESPONSES_KEY = "crm-form-responses";

export function useForms() {
  const [forms, setForms] = useState<WebForm[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(FORMS_KEY);
      if (saved) setForms(JSON.parse(saved));
    } catch {
      localStorage.removeItem(FORMS_KEY);
    }
  }, []);

  const persist = useCallback((updated: WebForm[]) => {
    setForms(updated);
    localStorage.setItem(FORMS_KEY, JSON.stringify(updated));
  }, []);

  const addForm = useCallback(
    (form: WebForm) => {
      persist([form, ...forms]);
      logActivity("create", "form", form.id, form.title);
    },
    [forms, persist]
  );

  const updateForm = useCallback(
    (id: string, data: Partial<WebForm>) => {
      const prev = forms.find((f) => f.id === id);
      persist(
        forms.map((f) =>
          f.id === id ? { ...f, ...data, updatedAt: new Date().toISOString() } : f
        )
      );
      if (prev) {
        if (data.status && data.status !== prev.status) {
          logActivity("status_change", "form", id, prev.title, undefined, {
            status: { from: prev.status, to: data.status },
          });
        } else {
          const changes = Object.keys(data).filter(
            (k) => (data as unknown as Record<string, unknown>)[k] !== (prev as unknown as Record<string, unknown>)[k]
          );
          logActivity("update", "form", id, prev.title, changes.join(", "));
        }
      }
    },
    [forms, persist]
  );

  const deleteForm = useCallback(
    (id: string) => {
      const prev = forms.find((f) => f.id === id);
      persist(forms.filter((f) => f.id !== id));
      if (prev) {
        logActivity("delete", "form", id, prev.title);
      }
    },
    [forms, persist]
  );

  return { forms, addForm, updateForm, deleteForm };
}

export function useFormResponses(formId?: string) {
  const [responses, setResponses] = useState<WebFormResponse[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RESPONSES_KEY);
      if (saved) {
        const all: WebFormResponse[] = JSON.parse(saved);
        setResponses(formId ? all.filter((r) => r.formId === formId) : all);
      }
    } catch {
      localStorage.removeItem(RESPONSES_KEY);
    }
  }, [formId]);

  const addResponse = useCallback(
    (response: WebFormResponse) => {
      try {
        const saved = localStorage.getItem(RESPONSES_KEY);
        const all: WebFormResponse[] = saved ? JSON.parse(saved) : [];
        const updated = [response, ...all];
        localStorage.setItem(RESPONSES_KEY, JSON.stringify(updated));
        if (!formId || response.formId === formId) {
          setResponses((prev) => [response, ...prev]);
        }

        // Update form response count
        const formsSaved = localStorage.getItem("crm-forms");
        if (formsSaved) {
          const forms: WebForm[] = JSON.parse(formsSaved);
          const updatedForms = forms.map((f) =>
            f.id === response.formId
              ? { ...f, responseCount: f.responseCount + 1 }
              : f
          );
          localStorage.setItem("crm-forms", JSON.stringify(updatedForms));
        }
      } catch {
        // silent
      }
    },
    [formId]
  );

  return { responses, addResponse };
}
