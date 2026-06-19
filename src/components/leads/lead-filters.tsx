"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeatLevel } from "@/lib/types";

interface LeadFiltersProps {
  activeFilter: HeatLevel | "all";
  onFilterChange: (filter: HeatLevel | "all") => void;
}

export function LeadFilters({ activeFilter, onFilterChange }: LeadFiltersProps) {
  const t = useTranslations("leads");

  const filters: { key: HeatLevel | "all"; label: string; dotClass?: string }[] = [
    { key: "all", label: t("allLeads") },
    { key: "hot", label: t("hotLeads"), dotClass: "bg-destructive" },
    { key: "warm", label: t("warmLeads"), dotClass: "bg-warning" },
    { key: "cold", label: t("coldLeads"), dotClass: "bg-primary" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <Button
          key={f.key}
          variant={activeFilter === f.key ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => onFilterChange(f.key)}
        >
          {f.dotClass && (
            <span className={cn("h-2 w-2 rounded-full me-2", f.dotClass)} />
          )}
          {f.label}
        </Button>
      ))}
    </div>
  );
}
