"use client";

import { useState, useEffect, useCallback } from "react";
import type { CalendarEvent, CalendarSync, CalendarEventType } from "@/lib/types";

const EVENTS_KEY = "crm-calendar-events";
const SYNC_KEY = "crm-calendar-sync";

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const DEFAULT_SYNCS: CalendarSync[] = [
  { provider: "google", connected: false },
  { provider: "outlook", connected: false },
  { provider: "apple", connected: false },
];

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [syncs, setSyncs] = useState<CalendarSync[]>(DEFAULT_SYNCS);

  useEffect(() => {
    setEvents(load(EVENTS_KEY, []));
    setSyncs(load(SYNC_KEY, DEFAULT_SYNCS));
  }, []);

  const saveEvents = useCallback((updated: CalendarEvent[]) => {
    setEvents(updated);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(updated));
  }, []);

  const addEvent = useCallback((data: {
    title: string;
    date: string;
    startTime?: string;
    endTime?: string;
    allDay?: boolean;
    type?: CalendarEventType;
    notes?: string;
    linkedLeadId?: string;
    linkedLeadName?: string;
    linkedCustomerId?: string;
    linkedCustomerName?: string;
    color?: string;
  }) => {
    const now = new Date().toISOString();
    const event: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: data.title,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      allDay: data.allDay ?? false,
      type: data.type ?? "other",
      notes: data.notes,
      linkedLeadId: data.linkedLeadId,
      linkedLeadName: data.linkedLeadName,
      linkedCustomerId: data.linkedCustomerId,
      linkedCustomerName: data.linkedCustomerName,
      color: data.color,
      createdAt: now,
      updatedAt: now,
    };
    saveEvents([event, ...events]);
    return event;
  }, [events, saveEvents]);

  const updateEvent = useCallback((id: string, data: Partial<CalendarEvent>) => {
    saveEvents(events.map((e) => (e.id === id ? { ...e, ...data, updatedAt: new Date().toISOString() } : e)));
  }, [events, saveEvents]);

  const deleteEvent = useCallback((id: string) => {
    saveEvents(events.filter((e) => e.id !== id));
  }, [events, saveEvents]);

  const toggleSync = useCallback((provider: CalendarSync["provider"]) => {
    const updated = syncs.map((s) =>
      s.provider === provider
        ? { ...s, connected: !s.connected, lastSyncAt: !s.connected ? new Date().toISOString() : s.lastSyncAt }
        : s
    );
    setSyncs(updated);
    localStorage.setItem(SYNC_KEY, JSON.stringify(updated));
  }, [syncs]);

  const getEventsForDate = useCallback((date: string) => {
    return events.filter((e) => e.date === date);
  }, [events]);

  return { events, syncs, addEvent, updateEvent, deleteEvent, toggleSync, getEventsForDate };
}
