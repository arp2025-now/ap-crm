"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  ArrowRight, ArrowLeft, Copy, Check, Link2, Mail,
  User2, Building2, AtSign, Phone, CalendarClock,
  Sparkles, Package, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { LineItemTable } from "@/components/quotes/line-item-table";
import { QuoteTotalsCard } from "@/components/quotes/quote-totals-card";
import { QuoteSectionsEditor } from "@/components/quotes/quote-sections-editor";
import { ProductPickerDialog } from "@/components/quotes/product-picker-dialog";
import { useQuotes } from "@/hooks/use-quotes";
import { useProducts } from "@/hooks/use-products";
import { useCustomers } from "@/hooks/use-customers";
import { useBranding } from "@/hooks/use-branding";
import { useSectionTemplates } from "@/hooks/use-section-templates";
import type { QuoteLineItem, QuoteSection, QuoteStatus } from "@/lib/types";

function computeTotals(items: QuoteLineItem[], taxRate: number, includeVat: boolean, globalDiscount: number = 0) {
  const subtotal = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const lineDiscounts = items.reduce(
    (sum, i) => sum + i.quantity * i.unitPrice * (i.discount / 100), 0
  );
  const afterLineDiscounts = subtotal - lineDiscounts;
  const globalDiscountAmount = afterLineDiscounts * (globalDiscount / 100);
  const discountTotal = lineDiscounts + globalDiscountAmount;
  const taxable = subtotal - discountTotal;
  const taxAmount = includeVat ? taxable * (taxRate / 100) : 0;
  const total = taxable + taxAmount;
  return { subtotal, discountTotal, taxAmount, total };
}

export default function QuoteBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("quotes");
  const quoteId = params.id as string;

  const { getQuoteById, updateQuote } = useQuotes();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const { branding } = useBranding();
  const sectionTemplates = useSectionTemplates();

  const quote = getQuoteById(quoteId);
  const customer = customers.find((c) => c.id === quote?.customerId);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const BackIcon = locale === "he" ? ArrowRight : ArrowLeft;

  const saveItems = useCallback(
    (items: QuoteLineItem[], taxRate?: number, includeVat?: boolean, globalDiscount?: number) => {
      if (!quote) return;
      const rate = taxRate ?? quote.taxRate;
      const vat = includeVat ?? (quote.includeVat ?? true);
      const gd = globalDiscount ?? (quote.globalDiscount ?? 0);
      const totals = computeTotals(items, rate, vat, gd);
      updateQuote(quoteId, { lineItems: items, taxRate: rate, includeVat: vat, globalDiscount: gd, ...totals });
    },
    [quote, quoteId, updateQuote]
  );

  const handleAddProduct = useCallback(
    (product: { id: string; name: string; description: string; price: number }) => {
      if (!quote) return;
      const newItem: QuoteLineItem = {
        id: `li-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        description: product.description,
        quantity: 1,
        unitPrice: product.price,
        discount: 0,
        total: product.price,
      };
      saveItems([...quote.lineItems, newItem]);
    },
    [quote, saveItems]
  );

  const handleUpdateItem = useCallback(
    (itemId: string, updates: Partial<QuoteLineItem>) => {
      if (!quote) return;
      const updated = quote.lineItems.map((i) =>
        i.id === itemId ? { ...i, ...updates } : i
      );
      saveItems(updated);
    },
    [quote, saveItems]
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      if (!quote) return;
      saveItems(quote.lineItems.filter((i) => i.id !== itemId));
    },
    [quote, saveItems]
  );

  const handleTaxRateChange = useCallback(
    (rate: number) => {
      if (!quote) return;
      saveItems(quote.lineItems, rate);
    },
    [quote, saveItems]
  );

  const handleVatToggle = useCallback(
    (checked: boolean) => {
      if (!quote) return;
      saveItems(quote.lineItems, undefined, checked);
    },
    [quote, saveItems]
  );

  const handleGlobalDiscountChange = useCallback(
    (discount: number) => {
      if (!quote) return;
      saveItems(quote.lineItems, undefined, undefined, discount);
    },
    [quote, saveItems]
  );

  const handleStatusChange = useCallback(
    (status: string | null) => {
      if (status) updateQuote(quoteId, { status: status as QuoteStatus });
    },
    [quoteId, updateQuote]
  );

  const handleNotesChange = useCallback(
    (notes: string) => updateQuote(quoteId, { notes }),
    [quoteId, updateQuote]
  );

  const handleTermsChange = useCallback(
    (terms: string) => updateQuote(quoteId, { terms }),
    [quoteId, updateQuote]
  );

  const handleValidUntilChange = useCallback(
    (validUntil: string) => updateQuote(quoteId, { validUntil }),
    [quoteId, updateQuote]
  );

  const handleSectionsChange = useCallback(
    (sections: QuoteSection[]) => updateQuote(quoteId, { sections }),
    [quoteId, updateQuote]
  );

  const shareableUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/${locale}/quote/${quoteId}`;
  }, [locale, quoteId]);

  const handleSendQuote = useCallback(() => {
    updateQuote(quoteId, { status: "sent" });

    const customerEmail = customer?.email || "";
    const subject = encodeURIComponent(
      locale === "he"
        ? `הצעת מחיר ${quote?.quoteNumber || ""} מ-${branding.companyName}`
        : `Quote ${quote?.quoteNumber || ""} from ${branding.companyName}`
    );
    const body = encodeURIComponent(
      locale === "he"
        ? `שלום ${customer?.name || ""},\n\nמצורף קישור להצעת המחיר שלך:\n${shareableUrl}\n\nבברכה,\n${branding.companyName}`
        : `Hi ${customer?.name || ""},\n\nHere is your quote:\n${shareableUrl}\n\nBest regards,\n${branding.companyName}`
    );

    window.open(`mailto:${customerEmail}?subject=${subject}&body=${body}`, "_blank");
  }, [quoteId, updateQuote, shareableUrl, customer, quote, locale, branding]);

  if (!quote) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        {t("quoteNotFound")}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Back link */}
      <button
        onClick={() => router.push(`/${locale}/quotes`)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <BackIcon className="h-4 w-4" />
        {t("backToQuotes")}
      </button>

      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -start-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold tracking-tight">{quote.quoteNumber}</h1>
                <QuoteStatusBadge status={quote.status} />
              </div>
              <p className="text-white/70 text-sm mt-0.5">
                {quote.customerName}
                {customer?.company && <span className="mx-1.5">&middot;</span>}
                {customer?.company}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={quote.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[140px] h-9 bg-white/15 border-white/20 text-white backdrop-blur-sm hover:bg-white/25 transition-colors">
                <SelectValue>
                  {{ draft: t("statusDraft"), sent: t("statusSent"), signed: t("statusSigned"), expired: t("statusExpired") }[quote.status]}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">{t("statusDraft")}</SelectItem>
                <SelectItem value="sent">{t("statusSent")}</SelectItem>
                <SelectItem value="signed">{t("statusSigned")}</SelectItem>
                <SelectItem value="expired">{t("statusExpired")}</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleSendQuote}
              className="gap-1.5 bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-lg"
            >
              <Mail className="h-4 w-4" />
              {t("sendQuote")}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Customer Card ── */}
      {customer && (
        <div className="rounded-2xl border bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-sky-600" />
            </div>
            <h3 className="text-sm font-bold text-sky-900 dark:text-sky-300">{t("customerDetails")}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: User2, label: t("customerName"), value: customer.name, color: "text-violet-500", bg: "bg-violet-500/10" },
              { icon: Building2, label: t("customerCompany"), value: customer.company || "—", color: "text-amber-500", bg: "bg-amber-500/10" },
              { icon: AtSign, label: t("customerEmail"), value: customer.email, color: "text-emerald-500", bg: "bg-emerald-500/10" },
              { icon: Phone, label: t("customerPhone"), value: customer.phone, color: "text-rose-500", bg: "bg-rose-500/10" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{item.label}</p>
                  <p className="text-sm font-semibold truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Line Items ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Package className="h-4 w-4 text-orange-600" />
          </div>
          <h3 className="text-sm font-bold">{t("lineItems")}</h3>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 ms-1">
            {quote.lineItems.length}
          </span>
        </div>
        <LineItemTable
          items={quote.lineItems}
          onUpdateItem={handleUpdateItem}
          onRemoveItem={handleRemoveItem}
          onAddItem={() => setPickerOpen(true)}
        />
      </div>

      {/* ── Totals + Valid Until ── */}
      <div className="grid md:grid-cols-2 gap-5">
        {/* Valid Until Card */}
        <div className="rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <CalendarClock className="h-4 w-4 text-amber-600" />
            </div>
            <label className="text-sm font-bold text-amber-900 dark:text-amber-300">{t("validUntil")}</label>
          </div>
          <Input
            type="date"
            value={quote.validUntil}
            onChange={(e) => handleValidUntilChange(e.target.value)}
            className="bg-white/80 dark:bg-white/5 border-amber-200 dark:border-amber-800 focus:ring-amber-500/30"
          />
        </div>

        {/* Totals */}
        <QuoteTotalsCard
          subtotal={quote.subtotal}
          globalDiscount={quote.globalDiscount ?? 0}
          discountTotal={quote.discountTotal}
          includeVat={quote.includeVat ?? true}
          taxRate={quote.taxRate}
          taxAmount={quote.taxAmount}
          total={quote.total}
          onTaxRateChange={handleTaxRateChange}
          onVatToggleChange={handleVatToggle}
          onGlobalDiscountChange={handleGlobalDiscountChange}
        />
      </div>

      {/* ── Sections Editor ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <QuoteSectionsEditor
          sections={quote.sections ?? []}
          onChange={handleSectionsChange}
          templates={sectionTemplates.templates}
          onSaveTemplate={sectionTemplates.addTemplate}
          onUpdateTemplate={sectionTemplates.updateTemplate}
          onDeleteTemplate={sectionTemplates.deleteTemplate}
          onApplyTemplate={sectionTemplates.applyTemplate}
        />
      </div>

      {/* ── Shareable Link ── */}
      {quote.status !== "draft" && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 p-4 flex items-center gap-3 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <Link2 className="h-5 w-5 text-emerald-600" />
          </div>
          <code className="text-sm flex-1 truncate text-emerald-800 dark:text-emerald-300 font-medium">{shareableUrl}</code>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 flex-shrink-0 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300"
            onClick={() => {
              navigator.clipboard.writeText(shareableUrl);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t("copied") : t("copyLink")}
          </Button>
        </div>
      )}

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        products={products}
        locale={locale}
        onSelect={handleAddProduct}
      />
    </div>
  );
}
