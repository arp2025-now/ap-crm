"use client";

import { useState, useCallback, useEffect } from "react";
import type { Lead, PipelineStage } from "@/lib/types";
import { defaultPipelineStages, mockLeads } from "@/lib/mock-data";

const STAGES_KEY = "crm-pipeline-stages";
const LEADS_KEY = "crm-pipeline-leads";

export function usePipeline() {
  const [stages, setStages] = useState<PipelineStage[]>(defaultPipelineStages);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);

  useEffect(() => {
    const savedStages = localStorage.getItem(STAGES_KEY);
    if (savedStages) setStages(JSON.parse(savedStages));
    const savedLeads = localStorage.getItem(LEADS_KEY);
    if (savedLeads) setLeads(JSON.parse(savedLeads));
  }, []);

  const saveStages = useCallback((updated: PipelineStage[]) => {
    setStages(updated);
    localStorage.setItem(STAGES_KEY, JSON.stringify(updated));
  }, []);

  const saveLeads = useCallback((updated: Lead[]) => {
    setLeads(updated);
    localStorage.setItem(LEADS_KEY, JSON.stringify(updated));
  }, []);

  const addStage = useCallback((stage: Omit<PipelineStage, "id" | "order">) => {
    const newStage: PipelineStage = {
      ...stage,
      id: `stage-${Date.now()}`,
      order: stages.length,
    };
    saveStages([...stages, newStage]);
  }, [stages, saveStages]);

  const updateStage = useCallback((id: string, updates: Partial<PipelineStage>) => {
    saveStages(stages.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, [stages, saveStages]);

  const deleteStage = useCallback((id: string) => {
    saveStages(stages.filter((s) => s.id !== id));
  }, [stages, saveStages]);

  const moveLead = useCallback((leadId: string, newStatus: string) => {
    saveLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)));
  }, [leads, saveLeads]);

  const getLeadsByStage = useCallback(
    (stageId: string) => leads.filter((l) => l.status === stageId),
    [leads]
  );

  return { stages, leads, addStage, updateStage, deleteStage, moveLead, getLeadsByStage };
}
