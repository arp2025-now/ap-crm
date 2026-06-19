"use client";

import { useState, useEffect, useCallback } from "react";
import type { Interaction } from "@/lib/types";

const STORAGE_KEY = "crm-interactions";

function loadInteractions(): Interaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInteractions(interactions: Interaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(interactions));
}

export function useInteractions() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);

  useEffect(() => {
    setInteractions(loadInteractions());
  }, []);

  const save = useCallback((updated: Interaction[]) => {
    setInteractions(updated);
    saveInteractions(updated);
  }, []);

  const addInteraction = useCallback((data: {
    entityType: "lead" | "customer";
    entityId: string;
    content: string;
  }) => {
    const interaction: Interaction = {
      id: `int-${Date.now()}`,
      entityType: data.entityType,
      entityId: data.entityId,
      content: data.content,
      createdAt: new Date().toISOString(),
      createdBy: "ענת",
    };
    save([interaction, ...interactions]);
    return interaction;
  }, [interactions, save]);

  const deleteInteraction = useCallback((id: string) => {
    save(interactions.filter((i) => i.id !== id));
  }, [interactions, save]);

  const getInteractionsForEntity = useCallback((entityType: "lead" | "customer", entityId: string) => {
    return interactions.filter((i) => i.entityType === entityType && i.entityId === entityId);
  }, [interactions]);

  return { interactions, addInteraction, deleteInteraction, getInteractionsForEntity };
}
