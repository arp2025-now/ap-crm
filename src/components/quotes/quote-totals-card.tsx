"use client";

import { useTranslations, useLocale } from "next-intl";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { Receipt, Percent, Sparkles, Calculator } from "lucide-react";

interface QuoteTotalsCardProps {
  subtotal: number;
  globalDiscount?: number;
  discountTotal: number;
  includeVat: boolean;
  taxRate: number;
  taxAmount: number;
  total: number;
  onTaxRateChange?: (rate: number) => void;
  onVatToggleChange?: (v: boolean) => void;
  onGlobalDiscountChange?: (discount: number) => void;
  readOnly?: boolean;
}

export function QuoteTotalsCard({
  subtotal, globalDiscount = 0, discountTotal, includeVat, taxRate, taxAmount, total,
  onTaxRateChange, onVatToggleChange, onGlobalDiscountChange, readOnly,
}: QuoteTotalsCardProps) {
  const t = useTranslations("quotes");
  const locale = useLocale();
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";

  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border border-violet-200 dark:border-violet-800 p-5 space-y-3 shadow-sm">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
            <Calculator className="h-4 w-4 text-violet-600" />
          </div>
          <span className="text-sm font-bold text-violet-900 dark:text-violet-300">{t("subtotal")}</span>
        </div>
        <span className="text-base font-bold text-violet-700 dark:text-violet-300">{formatCurrency(subtotal, fmtLocale)}</span>
      </div>

      {/* Global discount */}
      {!readOnly && onGlobalDiscountChange ? (
        <div className="flex items-center justify-between text-sm bg-white/60 dark:bg-white/5 rounded-xl px-3 py-2.5 border border-rose-200/50 dark:border-rose-800/50">
          <span className="text-muted-foreground flex items-center gap-2">
            <Percent className="h-3.5 w-3.5 text-rose-500" />
            {t("discountTotal")}
            <Input
              type="number"
              min={0}
              max={100}
              value={globalDiscount}
              onChange={(e) => onGlobalDiscountChange(parseFloat(e.target.value) || 0)}
              className="inline-block h-7 w-16 text-xs ms-1 px-2 bg-white dark:bg-white/10 border-rose-200 dark:border-rose-800"
            />
            <span className="text-xs">%</span>
          </span>
          {discountTotal > 0 && (
            <span className="text-rose-600 dark:text-rose-400 font-semibold">-{formatCurrency(discountTotal, fmtLocale)}</span>
          )}
        </div>
      ) : discountTotal > 0 ? (
        <div className="flex justify-between text-sm bg-white/60 dark:bg-white/5 rounded-xl px-3 py-2.5">
          <span className="text-muted-foreground flex items-center gap-2">
            <Percent className="h-3.5 w-3.5 text-rose-500" />
            {t("discountTotal")}
            {globalDiscount > 0 && <span className="text-xs">({globalDiscount}%)</span>}
          </span>
          <span className="text-rose-600 dark:text-rose-400 font-semibold">-{formatCurrency(discountTotal, fmtLocale)}</span>
        </div>
      ) : null}

      {/* VAT toggle */}
      {!readOnly && onVatToggleChange && (
        <div className="flex items-center gap-2 text-sm py-1 px-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div className="relative">
              <input
                type="checkbox"
                checked={includeVat}
                onChange={(e) => onVatToggleChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="h-5 w-9 rounded-full bg-gray-200 dark:bg-gray-700 peer-checked:bg-emerald-500 transition-colors" />
              <div className="absolute top-0.5 start-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4 rtl:peer-checked:-translate-x-4" />
            </div>
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">{t("includeVat")}</span>
          </label>
        </div>
      )}

      {includeVat && (
        <div className="flex items-center justify-between text-sm bg-white/60 dark:bg-white/5 rounded-xl px-3 py-2.5 border border-sky-200/50 dark:border-sky-800/50">
          <span className="text-muted-foreground flex items-center gap-2">
            <Receipt className="h-3.5 w-3.5 text-sky-500" />
            {t("taxRate")}
            {!readOnly && onTaxRateChange && (
              <Input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                className="inline-block h-7 w-16 text-xs ms-1 px-2 bg-white dark:bg-white/10 border-sky-200 dark:border-sky-800"
              />
            )}
            {readOnly && <span className="ms-1 text-xs">({taxRate}%)</span>}
          </span>
          <span className="font-semibold text-sky-700 dark:text-sky-300">{formatCurrency(taxAmount, fmtLocale)}</span>
        </div>
      )}

      {/* Grand Total */}
      <div className="rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-3 flex justify-between items-center font-bold text-lg mt-1 shadow-lg">
        <span className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-200" />
          {t("grandTotal")}
        </span>
        <span>{formatCurrency(total, fmtLocale)}</span>
      </div>
    </div>
  );
}
