"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface ProductPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  locale: string;
  onSelect: (product: Product) => void;
}

export function ProductPickerDialog({
  open, onOpenChange, products, locale, onSelect,
}: ProductPickerDialogProps) {
  const t = useTranslations("quotes");
  const [search, setSearch] = useState("");
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";

  const activeProducts = products.filter((p) => p.active);
  const filtered = search.trim()
    ? activeProducts.filter((p) =>
        [p.name, p.sku, p.category].some((v) => v.toLowerCase().includes(search.toLowerCase()))
      )
    : activeProducts;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col" showCloseButton>
        <DialogHeader>
          <DialogTitle>{t("selectProduct")}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchProducts")}
            className="ps-9"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">{t("noProducts")}</p>
          ) : (
            <div className="grid gap-1">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { onSelect(p); onOpenChange(false); setSearch(""); }}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-start hover:bg-muted/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.sku} · {p.category}</p>
                  </div>
                  <span className="font-bold text-sm text-secondary flex-shrink-0 ms-4">
                    {formatCurrency(p.price, fmtLocale)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
