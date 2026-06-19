"use client";

import { useTranslations } from "next-intl";
import { Columns3, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { LEAD_COLUMNS } from "@/hooks/use-column-visibility";
import { cn } from "@/lib/utils";

interface ColumnChooserProps {
  visible: string[];
  onToggle: (id: string) => void;
}

export function ColumnChooser({ visible, onToggle }: ColumnChooserProps) {
  const t = useTranslations("leads");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 bg-white/15 border-white/20 text-white backdrop-blur-sm hover:bg-white/25 transition-colors"
          />
        }
      >
        <Columns3 className="h-4 w-4" />
        {t("columns")}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Eye className="h-3.5 w-3.5 text-emerald-500" />
          <p className="text-xs text-muted-foreground font-semibold">{t("visibleColumns")}</p>
        </div>
        <DropdownMenuSeparator />
        {LEAD_COLUMNS.map((col) => {
          const checked = visible.includes(col.id);
          return (
            <DropdownMenuItem
              key={col.id}
              onClick={() => onToggle(col.id)}
              className={cn("flex items-center gap-2")}
            >
              <span className={cn(
                "h-4 w-4 flex-shrink-0 flex items-center justify-center rounded",
                checked ? "bg-emerald-500/15" : ""
              )}>
                {checked && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </span>
              {col.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
