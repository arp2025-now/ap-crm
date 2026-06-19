"use client";

import { useState, useEffect, useCallback } from "react";
import type { Lead } from "@/lib/types";
import { mockLeads } from "@/lib/mock-data";
import { logActivity } from "@/hooks/use-activity-log";

const STORAGE_KEY = "crm-leads";

type LeadInput = Omit<Lead, "id" | "serialNumber" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "customerId" | "assignedAgentId" | "lastContactAt">;

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLeads(JSON.parse(saved));
    } catch { localStorage.removeItem(STORAGE_KEY); }
  }, []);

  const persist = useCallback((updated: Lead[]) => {
    setLeads(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const nextSerial = useCallback(
    (current: Lead[]) => Math.max(0, ...current.map((l) => l.serialNumber ?? 0)) + 1,
    []
  );

  const addLead = useCallback(
    (data: LeadInput) => {
      const now = new Date().toISOString();
      const newLead: Lead = {
        ...data,
        id: `lead-${Date.now()}`,
        serialNumber: nextSerial(leads),
        customerId: `cust-${Date.now()}`,
        assignedAgentId: "agent-1",
        lastContactAt: now,
        createdAt: now,
        updatedAt: now,
        createdBy: "אני",
        updatedBy: "אני",
        customFields: data.customFields ?? {},
      };
      persist([newLead, ...leads]);
      logActivity("create", "lead", newLead.id, data.customerName, `ליד חדש #${newLead.serialNumber}`);
    },
    [leads, persist, nextSerial]
  );

  const updateLead = useCallback(
    (id: string, data: Partial<Lead>) => {
      const now = new Date().toISOString();
      const prev = leads.find((l) => l.id === id);
      persist(
        leads.map((l) =>
          l.id === id ? { ...l, ...data, updatedAt: now, updatedBy: "אני" } : l
        )
      );
      if (prev) {
        const changes: Record<string, { from?: string | number | null; to?: string | number | null }> = {};
        for (const key of Object.keys(data) as (keyof Lead)[]) {
          if (key === "updatedAt" || key === "updatedBy") continue;
          const oldVal = prev[key];
          const newVal = data[key];
          if (oldVal !== newVal) {
            changes[key] = { from: oldVal as any, to: newVal as any };
          }
        }
        const action = data.status === "converted" ? "convert" as const
          : data.status && data.status !== prev.status ? "status_change" as const
          : "update" as const;
        logActivity(action, "lead", id, prev.customerName, undefined, Object.keys(changes).length > 0 ? changes : undefined);
      }
    },
    [leads, persist]
  );

  const deleteLead = useCallback(
    (id: string) => {
      const prev = leads.find((l) => l.id === id);
      persist(leads.filter((l) => l.id !== id));
      if (prev) logActivity("delete", "lead", id, prev.customerName);
    },
    [leads, persist]
  );

  return { leads, addLead, updateLead, deleteLead };
}
