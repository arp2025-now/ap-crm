"use client";

import { useTranslations, useLocale } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { QuoteLineItem } from "@/lib/types";

interface LineItemTableProps {
  items: QuoteLineItem[];
  onUpdateItem: (id: string, updates: Partial<QuoteLineItem>) => void;
  onRemoveItem: (id: string) => void;
  onAddItem: () => void;
  readOnly?: boolean;
}

export function LineItemTable({
  items, onUpdateItem, onRemoveItem, onAddItem, readOnly,
}: LineItemTableProps) {
  const t = useTranslations("quotes");
  const locale = useLocale();
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";

  const handleNumberChange = (id: string, field: "quantity" | "unitPrice" | "discount", raw: string) => {
    const num = parseFloat(raw) || 0;
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const updated = { ...item, [field]: num };
    updated.total = updated.quantity * updated.unitPrice * (1 - updated.discount / 100);
    onUpdateItem(id, { [field]: num, total: updated.total });
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="min-w-[200px]">{t("productName")}</TableHead>
            <TableHead className="min-w-[140px]">{t("description")}</TableHead>
            <TableHead className="w-[90px]">{t("quantity")}</TableHead>
            <TableHead className="w-[110px]">{t("unitPrice")}</TableHead>
            <TableHead className="w-[80px]">{t("discount")}</TableHead>
            <TableHead className="w-[110px]">{t("lineTotal")}</TableHead>
            {!readOnly && <TableHead className="w-[50px]" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={readOnly ? 6 : 7} className="text-center py-8 text-muted-foreground text-sm">
                {t("noItems")}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-sm">{item.productName}</TableCell>
                <TableCell>
                  {readOnly ? (
                    <span className="text-sm text-muted-foreground">{item.description}</span>
                  ) : (
                    <Input
                      value={item.description}
                      onChange={(e) => onUpdateItem(item.id, { description: e.target.value })}
                      className="h-8 text-sm"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <span className="text-sm">{item.quantity}</span>
                  ) : (
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleNumberChange(item.id, "quantity", e.target.value)}
                      className="h-8 text-sm w-20"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <span className="text-sm">{formatCurrency(item.unitPrice, fmtLocale)}</span>
                  ) : (
                    <Input
                      type="number"
                      min={0}
                      value={item.unitPrice}
                      onChange={(e) => handleNumberChange(item.id, "unitPrice", e.target.value)}
                      className="h-8 text-sm w-24"
                    />
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <span className="text-sm">{item.discount}%</span>
                  ) : (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={item.discount}
                      onChange={(e) => handleNumberChange(item.id, "discount", e.target.value)}
                      className="h-8 text-sm w-16"
                    />
                  )}
                </TableCell>
                <TableCell className="font-bold text-sm text-secondary">
                  {formatCurrency(item.total, fmtLocale)}
                </TableCell>
                {!readOnly && (
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!readOnly && (
        <div className="p-3 border-t">
          <Button variant="outline" size="sm" onClick={onAddItem} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            {t("addItem")}
          </Button>
        </div>
      )}
    </div>
  );
}
