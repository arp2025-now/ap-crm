"use client";

import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FieldDefinition } from "@/lib/field-definitions";

interface DynamicFieldInputProps {
  field: FieldDefinition;
  value: string | number | null | undefined;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
}

export function DynamicFieldInput({ field, value, onChange, placeholder }: DynamicFieldInputProps) {
  const strVal = value != null ? String(value) : "";

  switch (field.type) {
    case "text":
      return (
        <Input
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? field.name}
          required={field.required}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          min="0"
          value={strVal}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          placeholder="0"
          required={field.required}
        />
      );

    case "textarea":
      return (
        <textarea
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder ?? field.name}
          className={cn(
            "w-full resize-none rounded-lg border border-input bg-transparent px-3 py-2 text-sm",
            "placeholder:text-muted-foreground outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          )}
        />
      );

    case "dropdown":
    case "status": {
      const options = field.options ?? [];
      const selected = options.find((o) => o.id === strVal);
      return (
        <Select value={strVal || undefined} onValueChange={(v) => onChange(v ?? null)}>
          <SelectTrigger className="w-full">
            {selected ? (
              <span className="flex items-center gap-2 text-sm">
                {selected.color && field.type === "status" && (
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: selected.color }}
                  />
                )}
                {selected.label}
              </span>
            ) : (
              <SelectValue placeholder={`בחר ${field.name}`} />
            )}
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                <span className="flex items-center gap-2">
                  {opt.color && field.type === "status" && (
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: opt.color }}
                    />
                  )}
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    default:
      return null;
  }
}
