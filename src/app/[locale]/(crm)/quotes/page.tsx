"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Plus, Settings2, FileText } from "lucide-react";
import { FilterBar } from "@/components/leads/filter-bar";
import { ViewsTabs } from "@/components/shared/views-tabs";
import { QuotesTable } from "@/components/quotes/quotes-table";
import { QuoteFormDialog } from "@/components/quotes/quote-form-dialog";
import { FieldManagerDialog } from "@/components/leads/field-manager-dialog";
import { Button } from "@/components/ui/button";
import { useQuotes } from "@/hooks/use-quotes";
import { useQuoteFields } from "@/hooks/use-quote-fields";
import { useQuotesSearch } from "@/hooks/use-quotes-search";
import { useCustomers } from "@/hooks/use-customers";
import { useSavedViews } from "@/hooks/use-saved-views";
import type { Quote } from "@/lib/types";

export default function QuotesPage() {
  const t = useTranslations("quotes");
  const locale = useLocale();
  const router = useRouter();
  const { quotes, addQuote, deleteQuote, nextSerial } = useQuotes();
  const { customers } = useCustomers();
  const { fields, addField, updateField, deleteField } = useQuoteFields();

  const {
    searchText, setSearchText,
    fieldFilters, setFilter, clearFilter, clearAll, applyFilters,
    filteredQuotes, activeFilterCount,
  } = useQuotesSearch(quotes, fields);

  const savedViews = useSavedViews("crm-quote-views", { searchText, fieldFilters });

  const [formOpen, setFormOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  const handleCreateQuote = (data: { customerId: string; customerName: string; validUntil: string; notes: string; terms: string }) => {
    const now = new Date().toISOString();
    const serial = nextSerial();
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      serialNumber: serial,
      quoteNumber: `Q-${String(serial).padStart(4, "0")}`,
      customerId: data.customerId,
      customerName: data.customerName,
      status: "draft",
      lineItems: [],
      subtotal: 0,
      globalDiscount: 0,
      discountTotal: 0,
      includeVat: true,
      taxRate: 17,
      taxAmount: 0,
      total: 0,
      validUntil: data.validUntil,
      notes: data.notes,
      terms: data.terms,
      sections: [],
      createdAt: now,
      updatedAt: now,
      createdBy: "אני",
      updatedBy: "אני",
      customFields: {},
    };
    addQuote(newQuote);
    router.push(`/${locale}/quotes/${newQuote.id}`);
  };

  const handleEditQuote = (q: Quote) => {
    router.push(`/${locale}/quotes/${q.id}`);
  };

  const handleSelectView = (view: ReturnType<typeof useSavedViews>["activeView"]) => {
    if (!view) {
      clearAll();
      savedViews.setActiveViewId(null);
    } else {
      applyFilters(view.searchText, view.fieldFilters);
      savedViews.setActiveViewId(view.id);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 px-8 py-8">
        {/* Decorative blur blobs */}
        <div className="pointer-events-none absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 start-1/3 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
              <p className="mt-1 text-sm text-white/80">{t("subtitle")}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setManagerOpen(true)}
              className="bg-white/15 border-white/20 text-white backdrop-blur-sm hover:bg-white/25"
            >
              <Settings2 className="h-4 w-4 me-2" />
              {t("manageFields")}
            </Button>
            <Button
              onClick={() => setFormOpen(true)}
              className="bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-lg"
            >
              <Plus className="h-4 w-4 me-2" />
              {t("createQuote")}
            </Button>
          </div>
        </div>
      </div>

      <ViewsTabs
        views={savedViews.views}
        activeViewId={savedViews.activeViewId}
        isDirty={savedViews.isDirty}
        onSelectView={handleSelectView}
        onSaveView={savedViews.saveView}
        onUpdateView={savedViews.updateView}
        onDeleteView={savedViews.deleteView}
        onRenameView={savedViews.renameView}
      />

      <FilterBar
        fields={fields}
        searchText={searchText}
        fieldFilters={fieldFilters}
        activeFilterCount={activeFilterCount}
        onSearchChange={setSearchText}
        onSetFilter={setFilter}
        onClearFilter={clearFilter}
        onClearAll={clearAll}
      />

      <QuotesTable
        quotes={filteredQuotes}
        onEdit={handleEditQuote}
        onDelete={deleteQuote}
      />

      <QuoteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customers={customers}
        onSave={handleCreateQuote}
      />

      <FieldManagerDialog
        open={managerOpen}
        onOpenChange={setManagerOpen}
        fields={fields}
        onUpdateField={updateField}
        onDeleteField={deleteField}
        onAddField={addField}
      />
    </div>
  );
}
