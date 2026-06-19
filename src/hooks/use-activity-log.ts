"use client";

import { useState, useEffect, useCallback } from "react";
import type { ActivityLog, LogAction, LogEntityType } from "@/lib/types";

const STORAGE_KEY = "crm-activity-logs";
const MAX_LOGS = 500; // keep last 500 entries

function loadLogs(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setLogs(loadLogs());
  }, []);

  const addLog = useCallback(
    (entry: Omit<ActivityLog, "id" | "timestamp" | "userId" | "userName">) => {
      const newLog: ActivityLog = {
        ...entry,
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        userId: "current-user",
        userName: "אני",
      };
      const updated = [newLog, ...loadLogs()].slice(0, MAX_LOGS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setLogs(updated);
      return newLog;
    },
    []
  );

  const clearLogs = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setLogs([]);
  }, []);

  return { logs, addLog, clearLogs };
}

// ── Standalone logger (for use inside other hooks without React state) ──

export function logActivity(
  action: LogAction,
  entityType: LogEntityType,
  entityId: string,
  entityName: string,
  details?: string,
  changes?: Record<string, { from?: string | number | null; to?: string | number | null }>,
) {
  const entry: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    entityType,
    entityId,
    entityName,
    details,
    changes,
    userId: "current-user",
    userName: "אני",
  };
  try {
    const existing = loadLogs();
    const updated = [entry, ...existing].slice(0, MAX_LOGS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // storage full — silent
  }
}
