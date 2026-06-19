"use client";

import { useState, useMemo } from "react";
import type { Lead, HeatLevel } from "@/lib/types";

export function useLeadsFilter(leads: Lead[]) {
  const [activeFilter, setActiveFilter] = useState<HeatLevel | "all">("all");

  const filteredLeads = useMemo(() => {
    if (activeFilter === "all") return leads;
    return leads.filter((l) => l.heatLevel === activeFilter);
  }, [leads, activeFilter]);

  return { activeFilter, setActiveFilter, filteredLeads };
}
