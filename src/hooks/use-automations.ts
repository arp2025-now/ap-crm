"use client";

import { useState, useEffect, useCallback } from "react";
import type { Webhook, ApiKey, Automation, AutomationStep, AutomationTriggerConfig } from "@/lib/types";
import { logActivity } from "@/hooks/use-activity-log";

const WEBHOOKS_KEY = "crm-webhooks";
const API_KEYS_KEY = "crm-api-keys";
const AUTOMATIONS_KEY = "crm-automations";

function loadFromStorage<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Simple base64 "encryption" for demo — in production use server-side encryption
function encryptKey(key: string): string {
  return btoa(key);
}

function getKeyPreview(key: string): string {
  if (key.length <= 4) return "****";
  return "•".repeat(key.length - 4) + key.slice(-4);
}

// ── Webhooks ──

export function useWebhooks() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

  useEffect(() => {
    setWebhooks(loadFromStorage<Webhook>(WEBHOOKS_KEY, []));
  }, []);

  const save = useCallback((updated: Webhook[]) => {
    setWebhooks(updated);
    saveToStorage(WEBHOOKS_KEY, updated);
  }, []);

  const addWebhook = useCallback((data: Omit<Webhook, "id" | "createdAt" | "lastTriggeredAt">) => {
    const webhook: Webhook = {
      ...data,
      id: `wh-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    save([...webhooks, webhook]);
    logActivity("create", "webhook", webhook.id, data.name);
    return webhook;
  }, [webhooks, save]);

  const updateWebhook = useCallback((id: string, data: Partial<Webhook>) => {
    save(webhooks.map((w) => (w.id === id ? { ...w, ...data } : w)));
  }, [webhooks, save]);

  const deleteWebhook = useCallback((id: string) => {
    const prev = webhooks.find((w) => w.id === id);
    save(webhooks.filter((w) => w.id !== id));
    if (prev) {
      logActivity("delete", "webhook", id, prev.name);
    }
  }, [webhooks, save]);

  const toggleWebhook = useCallback((id: string) => {
    save(webhooks.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));
  }, [webhooks, save]);

  return { webhooks, addWebhook, updateWebhook, deleteWebhook, toggleWebhook };
}

// ── API Keys ──

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  useEffect(() => {
    setApiKeys(loadFromStorage<ApiKey>(API_KEYS_KEY, []));
  }, []);

  const save = useCallback((updated: ApiKey[]) => {
    setApiKeys(updated);
    saveToStorage(API_KEYS_KEY, updated);
  }, []);

  const addApiKey = useCallback((name: string, service: string, rawKey: string) => {
    const apiKey: ApiKey = {
      id: `key-${Date.now()}`,
      name,
      service,
      keyPreview: getKeyPreview(rawKey),
      encryptedKey: encryptKey(rawKey),
      createdAt: new Date().toISOString(),
    };
    save([...apiKeys, apiKey]);
    return apiKey;
  }, [apiKeys, save]);

  const deleteApiKey = useCallback((id: string) => {
    save(apiKeys.filter((k) => k.id !== id));
  }, [apiKeys, save]);

  return { apiKeys, addApiKey, deleteApiKey };
}

// ── Automations (Supabase-backed) ──

import { createClient } from "@/lib/supabase/client";
import type { DbAutomation } from "@/lib/supabase/types";

function dbToAutomation(row: DbAutomation): Automation {
  return {
    id: row.id,
    name: row.name,
    description: "",
    active: row.active,
    trigger: row.trigger as Automation["trigger"],
    triggerConfig: (row.trigger_config ?? {}) as Automation["triggerConfig"],
    steps: (row.steps ?? []) as unknown as Automation["steps"],
    runCount: row.run_count,
    lastRunAt: row.last_run_at ?? undefined,
    isPreset: row.is_preset ?? false,
    makeScenarioId: row.make_scenario_id ?? undefined,
    category: row.category ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function useAutomations() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const supabase = createClient();

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("automations")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setAutomations((data as DbAutomation[]).map(dbToAutomation));
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const addAutomation = useCallback(async (data: Omit<Automation, "id" | "createdAt" | "updatedAt" | "runCount" | "lastRunAt">) => {
    const { data: row, error } = await supabase
      .from("automations")
      .insert({
        name: data.name,
        active: data.active ?? true,
        trigger: data.trigger,
        trigger_config: data.triggerConfig ?? {},
        steps: data.steps ?? [],
        run_count: 0,
      })
      .select()
      .single();
    if (error) throw error;
    const automation = dbToAutomation(row as DbAutomation);
    setAutomations((prev) => [automation, ...prev]);
    logActivity("create", "automation", automation.id, data.name);
    return automation;
  }, [supabase]);

  const updateAutomation = useCallback(async (id: string, data: Partial<Automation>) => {
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.name !== undefined) updates.name = data.name;
    if (data.active !== undefined) updates.active = data.active;
    if (data.trigger !== undefined) updates.trigger = data.trigger;
    if (data.triggerConfig !== undefined) updates.trigger_config = data.triggerConfig;
    if (data.steps !== undefined) updates.steps = data.steps;
    const { error } = await supabase.from("automations").update(updates).eq("id", id);
    if (error) throw error;
    setAutomations((prev) => prev.map((a) => a.id === id ? { ...a, ...data, updatedAt: updates.updated_at as string } : a));
    const prev = automations.find((a) => a.id === id);
    if (prev) logActivity("update", "automation", id, prev.name);
  }, [supabase, automations]);

  const deleteAutomation = useCallback(async (id: string) => {
    const prev = automations.find((a) => a.id === id);
    const { error } = await supabase.from("automations").delete().eq("id", id);
    if (error) throw error;
    setAutomations((prev2) => prev2.filter((a) => a.id !== id));
    if (prev) logActivity("delete", "automation", id, prev.name);
  }, [supabase, automations]);

  const toggleAutomation = useCallback(async (id: string) => {
    const current = automations.find((a) => a.id === id);
    if (!current) return;
    await updateAutomation(id, { active: !current.active });
  }, [automations, updateAutomation]);

  return { automations, addAutomation, updateAutomation, deleteAutomation, toggleAutomation };
}
