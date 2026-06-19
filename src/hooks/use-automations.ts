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

// ── Automations ──

export function useAutomations() {
  const [automations, setAutomations] = useState<Automation[]>([]);

  useEffect(() => {
    setAutomations(loadFromStorage<Automation>(AUTOMATIONS_KEY, []));
  }, []);

  const save = useCallback((updated: Automation[]) => {
    setAutomations(updated);
    saveToStorage(AUTOMATIONS_KEY, updated);
  }, []);

  const addAutomation = useCallback((data: Omit<Automation, "id" | "createdAt" | "updatedAt" | "runCount" | "lastRunAt">) => {
    const automation: Automation = {
      ...data,
      id: `auto-${Date.now()}`,
      runCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    save([...automations, automation]);
    logActivity("create", "automation", automation.id, data.name);
    return automation;
  }, [automations, save]);

  const updateAutomation = useCallback((id: string, data: Partial<Automation>) => {
    const prev = automations.find((a) => a.id === id);
    save(automations.map((a) => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a)));
    if (prev) {
      logActivity("update", "automation", id, prev.name);
    }
  }, [automations, save]);

  const deleteAutomation = useCallback((id: string) => {
    const prev = automations.find((a) => a.id === id);
    save(automations.filter((a) => a.id !== id));
    if (prev) {
      logActivity("delete", "automation", id, prev.name);
    }
  }, [automations, save]);

  const toggleAutomation = useCallback((id: string) => {
    save(automations.map((a) => (a.id === id ? { ...a, active: !a.active, updatedAt: new Date().toISOString() } : a)));
  }, [automations, save]);

  return { automations, addAutomation, updateAutomation, deleteAutomation, toggleAutomation };
}
