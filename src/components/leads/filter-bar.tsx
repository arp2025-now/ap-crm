"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Search, X, Plus, Filter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { FieldDefinition } from "@/lib/field-definitions";

interface FilterBarProps {
  fields: FieldDefinition[];
  searchText: string;
  fieldFilters: Record<string, string>;
  activeFilterCount: number;
  onSearchChange: (v: string) => void;
  onSetFilter: (fieldId: string, value: string) => void;
  onClearFilter: (fieldId: string) => void;
  onClearAll: () => void;
}

export function FilterBar({
  fields, searchText, fieldFilters, activeFilterCount,
  onSearchChange, onSetFilter, onClearFilter, onClearAll,
}: FilterBarProps) {
  const tc = useTranslations("common");
  const [pendingFieldId, setPendingFieldId] = useState<string | null>(null);
  const [pendingValue, setPendingValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const pendingField = pendingFieldId ? fields.find((f) => f.id === pendingFieldId) : null;

  const availableFields = fields.filter(
    (f) => f.type !== "textarea" && !fieldFilters[f.id]
  );

  useEffect(() => {
    if (pendingField && (pendingField.type === "text" || pendingField.type === "number")) {
      inputRef.current?.focus();
    }
  }, [pendingField]);

  const confirmPending = () => {
    if (pendingFieldId && pendingValue.trim()) {
      onSetFilter(pendingFieldId, pendingValue.trim());
    }
    setPendingFieldId(null);
    setPendingValue("");
  };

  const cancelPending = () => {
    setPendingFieldId(null);
    setPendingValue("");
  };

  const getDisplayValue = (fieldId: string, value: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field?.type === "status" || field?.type === "dropdown") {
      return field.options?.find((o) => o.id === value)?.label ?? value;
    }
    return value;
  };

  return (
    <div className="rounded-2xl border bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/50 dark:to-gray-950/50 p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search icon label */}
        <div className="h-8 w-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
        </div>

        {/* Global text search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute start-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={tc("search")}
            className="ps-8 h-9 bg-white dark:bg-white/5 border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500/30 focus:border-emerald-400"
          />
        </div>

        {/* Active filter chips */}
        {Object.entries(fieldFilters).map(([fieldId, value]) => {
          const field = fields.find((f) => f.id === fieldId);
          return (
            <Badge
              key={fieldId}
              variant="secondary"
              className="h-8 gap-1.5 ps-3 pe-1.5 text-sm font-normal bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-700 rounded-xl"
            >
              <Filter className="h-3 w-3 text-emerald-500 flex-shrink-0" />
              <span className="text-muted-foreground">{field?.name ?? fieldId}:</span>
              <span className="font-semibold">{getDisplayValue(fieldId, value)}</span>
              <button
                onClick={() => onClearFilter(fieldId)}
                className="ms-0.5 rounded-full p-0.5 hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}

        {/* Pending filter input — status/dropdown */}
        {pendingField && (pendingField.type === "status" || pendingField.type === "dropdown") && (
          <div className="flex items-center gap-1 bg-white dark:bg-white/5 rounded-xl px-2 py-1 border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs text-muted-foreground font-medium">{pendingField.name}:</span>
            <Select
              onValueChange={(v: string | null) => {
                if (v && pendingFieldId) {
                  onSetFilter(pendingFieldId, v);
                  setPendingFieldId(null);
                }
              }}
            >
              <SelectTrigger className="h-7 min-w-[120px] w-auto max-w-[180px] text-xs border-0 shadow-none">
                <SelectValue placeholder={tc("select")} />
              </SelectTrigger>
              <SelectContent>
                {pendingField.options!.map((opt) => (
                  <SelectItem key={opt.id} value={opt.id}>
                    <span className="flex items-center gap-1.5">
                      {opt.color && (
                        <span
                          className="h-2 w-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: opt.color }}
                        />
                      )}
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button onClick={cancelPending} className="p-0.5 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Pending filter input — text/number */}
        {pendingField && (pendingField.type === "text" || pendingField.type === "number") && (
          <div className="flex items-center gap-1 bg-white dark:bg-white/5 rounded-xl px-2 py-1 border border-emerald-200 dark:border-emerald-800">
            <span className="text-xs text-muted-foreground font-medium">{pendingField.name}:</span>
            <Input
              ref={inputRef}
              type={pendingField.type === "number" ? "number" : "text"}
              value={pendingValue}
              onChange={(e) => setPendingValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmPending();
                if (e.key === "Escape") cancelPending();
              }}
              placeholder={tc("typeValue")}
              className="h-7 w-[140px] text-xs border-0 shadow-none"
            />
            <button onClick={cancelPending} className="p-0.5 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Add filter button */}
        {!pendingFieldId && availableFields.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 rounded-xl border-dashed border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-400 text-emerald-700 dark:text-emerald-300"
                />
              }
            >
              <Plus className="h-3.5 w-3.5" />
              {tc("addFilter")}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {availableFields.map((field) => (
                <DropdownMenuItem
                  key={field.id}
                  onClick={() => {
                    setPendingFieldId(field.id);
                    setPendingValue("");
                  }}
                >
                  {field.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Clear all */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 gap-1"
            onClick={onClearAll}
          >
            <X className="h-3.5 w-3.5" />
            {tc("clearFilters", { count: activeFilterCount })}
          </Button>
        )}
      </div>
    </div>
  );
}
