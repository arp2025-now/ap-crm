"use client";

import { useState, useEffect, useCallback } from "react";

export interface SavedView {
  id: string;
  name: string;
  searchText: string;
  fieldFilters: Record<string, string>;
}

export function useSavedViews(
  storageKey: string,
  currentFilters: { searchText: string; fieldFilters: Record<string, string> }
) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [activeViewId, setActiveViewId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setViews(JSON.parse(saved));
    } catch { localStorage.removeItem(storageKey); }
  }, [storageKey]);

  const persist = useCallback((updated: SavedView[]) => {
    setViews(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }, [storageKey]);

  const saveView = useCallback((name: string) => {
    const newView: SavedView = {
      id: `view_${Date.now()}`,
      name,
      searchText: currentFilters.searchText,
      fieldFilters: { ...currentFilters.fieldFilters },
    };
    const updated = [...views, newView];
    persist(updated);
    setActiveViewId(newView.id);
    return newView;
  }, [views, currentFilters, persist]);

  const updateView = useCallback((id: string) => {
    persist(views.map((v) =>
      v.id === id
        ? { ...v, searchText: currentFilters.searchText, fieldFilters: { ...currentFilters.fieldFilters } }
        : v
    ));
  }, [views, currentFilters, persist]);

  const deleteView = useCallback((id: string) => {
    persist(views.filter((v) => v.id !== id));
    if (activeViewId === id) setActiveViewId(null);
  }, [views, activeViewId, persist]);

  const renameView = useCallback((id: string, name: string) => {
    persist(views.map((v) => v.id === id ? { ...v, name } : v));
  }, [views, persist]);

  const activeView = views.find((v) => v.id === activeViewId) ?? null;

  const isDirty = activeView !== null && (
    activeView.searchText !== currentFilters.searchText ||
    JSON.stringify(activeView.fieldFilters) !== JSON.stringify(currentFilters.fieldFilters)
  );

  return {
    views,
    activeViewId,
    activeView,
    isDirty,
    setActiveViewId,
    saveView,
    updateView,
    deleteView,
    renameView,
  };
}
