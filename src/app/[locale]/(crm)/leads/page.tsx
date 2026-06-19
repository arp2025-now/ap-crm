"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus, Settings2, Users, Zap, TrendingUp,
  Flame, Snowflake, Thermometer, UserCheck,
} from "lucide-react";
import { FilterBar } from "@/components/leads/filter-bar";
import { LeadsTable } from "@/components/leads/leads-table";
import { ColumnChooser } from "@/components/leads/column-chooser";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import { FieldManagerDialog } from "@/components/leads/field-manager-dialog";
import { ConvertDialog } from "@/components/leads/convert-dialog";
import { DuplicateDialog } from "@/components/leads/duplicate-dialog";
import { Button } from "@/components/ui/button";
import { useLeads } from "@/hooks/use-leads";
import { useCustomers } from "@/hooks/use-customers";
import { useFieldDefinitions } from "@/hooks/use-field-definitions";
import { useColumnVisibility } from "@/hooks/use-column-visibility";
import { useLeadsSearch } from "@/hooks/use-leads-search";
import { useSavedViews } from "@/hooks/use-saved-views";
import { ViewsTabs } from "@/components/shared/views-tabs";
import { isBuiltIn } from "@/lib/field-definitions";
import { formatCurrency } from "@/lib/utils";
import type { Lead, Customer } from "@/lib/types";

type LeadInput = Omit<Lead, "id" | "serialNumber" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "customerId" | "assignedAgentId" | "lastContactAt">;

export default function LeadsPage() {
  const t = useTranslations("leads");
  const { leads, addLead, updateLead, deleteLead } = useLeads();
  const { addCustomer, nextSerial } = useCustomers();
  const { fields, addField, updateField, deleteField } = useFieldDefinitions();
  const { visible, toggle } = useColumnVisibility();
  const {
    searchText, setSearchText, fieldFilters, setFilter, clearFilter, clearAll, applyFilters,
    filteredLeads, activeFilterCount,
  } = useLeadsSearch(leads, fields);

  const savedViews = useSavedViews("crm-leads-views", { searchText, fieldFilters });

  // Form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Field manager
  const [managerOpen, setManagerOpen] = useState(false);

  // Convert dialog
  const [convertOpen, setConvertOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  // Duplicate dialog
  const [dupOpen, setDupOpen] = useState(false);
  const [dupMatch, setDupMatch] = useState<Lead | null>(null);
  const [dupField, setDupField] = useState<"phone" | "email">("email");
  const [pendingData, setPendingData] = useState<{
    builtIn: Partial<Lead>;
    customFields: Record<string, string | number | null>;
  } | null>(null);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalLeads = leads.length;
  const hotLeads = leads.filter((l) => l.heatLevel === "hot").length;
  const warmLeads = leads.filter((l) => l.heatLevel === "warm").length;
  const coldLeads = leads.filter((l) => l.heatLevel === "cold").length;
  const totalPipeline = leads.reduce((sum, l) => sum + (l.pipelineValue || 0), 0);
  const convertedLeads = leads.filter((l) => l.status === "converted").length;

  // ── Open helpers ──────────────────────────────────────────────────────────
  const openCreate = () => { setEditingLead(null); setFormOpen(true); };
  const openEdit = (lead: Lead) => { setEditingLead(lead); setFormOpen(true); };
  const openConvert = (lead: Lead) => { setConvertingLead(lead); setConvertOpen(true); };

  // ── Save with duplicate check ──────────────────────────────────────────────
  const doSave = (
    builtIn: Partial<Lead>,
    customFields: Record<string, string | number | null>
  ) => {
    const topLevel: Partial<Lead> = {};
    Object.entries(builtIn).forEach(([k, v]) => {
      if (isBuiltIn(k)) (topLevel as Record<string, unknown>)[k] = v;
    });

    if (editingLead) {
      updateLead(editingLead.id, { ...topLevel, customFields: { ...editingLead.customFields, ...customFields } });
    } else {
      addLead({
        customerName: (topLevel.customerName as string) ?? "",
        phone: (topLevel.phone as string) ?? "",
        customerEmail: (topLevel.customerEmail as string) ?? "",
        status: (topLevel.status as string) ?? "new",
        heatLevel: (topLevel.heatLevel as Lead["heatLevel"]) ?? "warm",
        pipelineValue: (topLevel.pipelineValue as number) ?? 0,
        company: topLevel.company as string | undefined,
        notes: topLevel.notes as string | undefined,
        customFields,
      });
    }
  };

  const handleSave = (
    builtIn: Partial<Lead>,
    customFields: Record<string, string | number | null>
  ) => {
    // Only check duplicates on creation
    if (!editingLead) {
      const phone = builtIn.phone as string | undefined;
      const email = builtIn.customerEmail as string | undefined;
      const byPhone = phone ? leads.find((l) => l.phone && l.phone === phone) : null;
      const byEmail = email ? leads.find((l) => l.customerEmail === email) : null;
      const dup = byPhone ?? byEmail;

      if (dup) {
        setPendingData({ builtIn, customFields });
        setDupMatch(dup);
        setDupField(byPhone ? "phone" : "email");
        setDupOpen(true);
        return;
      }
    }
    doSave(builtIn, customFields);
  };

  // ── Convert lead to customer ──────────────────────────────────────────────
  const handleConvert = (lead: Lead) => {
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      serialNumber: nextSerial(),
      name: lead.customerName,
      phone: lead.phone,
      email: lead.customerEmail,
      company: lead.company ?? "",
      industry: "",
      assignedAgentId: lead.assignedAgentId,
      tags: [],
      sentimentScore: 0,
      lifetimeValue: lead.pipelineValue,
      healthGrade: "—",
      lifecycleStage: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "אני",
      updatedBy: "אני",
      convertedFromLeadId: lead.id,
      convertedAt: now,
    };
    addCustomer(newCustomer);
    updateLead(lead.id, { status: "converted" });
  };

  const handleSelectView = (view: import("@/hooks/use-saved-views").SavedView | null) => {
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
      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -start-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
              <p className="text-white/70 text-sm mt-0.5">{t("subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ColumnChooser visible={visible} onToggle={toggle} />
            <Button
              variant="outline"
              onClick={() => setManagerOpen(true)}
              className="gap-1.5 bg-white/15 border-white/20 text-white backdrop-blur-sm hover:bg-white/25 transition-colors"
            >
              <Settings2 className="h-4 w-4" />
              {t("manageFields")}
            </Button>
            <Button
              onClick={openCreate}
              className="gap-1.5 bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-lg"
            >
              <Plus className="h-4 w-4" />
              {t("addLead")}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Leads */}
        <div className="rounded-2xl border bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Users className="h-4 w-4 text-violet-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{t("totalLeads")}</span>
          </div>
          <p className="text-2xl font-extrabold text-violet-700 dark:text-violet-300">{totalLeads}</p>
        </div>

        {/* Hot */}
        <div className="rounded-2xl border bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <Flame className="h-4 w-4 text-rose-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{t("hotLeads")}</span>
          </div>
          <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-300">{hotLeads}</p>
        </div>

        {/* Warm */}
        <div className="rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Thermometer className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{t("warmLeads")}</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-300">{warmLeads}</p>
        </div>

        {/* Pipeline Value */}
        <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{t("pipelineTotal")}</span>
          </div>
          <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">{formatCurrency(totalPipeline, "he-IL")}</p>
        </div>

        {/* Converted */}
        <div className="rounded-2xl border bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-sky-950/30 dark:to-cyan-950/30 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-sky-600" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{t("convertedLeads")}</span>
          </div>
          <p className="text-2xl font-extrabold text-sky-700 dark:text-sky-300">{convertedLeads}</p>
        </div>
      </div>

      {/* ── Views Tabs ── */}
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

      {/* ── Filter Bar ── */}
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

      {/* ── Table ── */}
      <LeadsTable
        leads={filteredLeads}
        fields={fields}
        visibleColumns={visible}
        onEdit={openEdit}
        onDelete={deleteLead}
        onConvert={openConvert}
      />

      {/* Dialogs */}
      <LeadFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lead={editingLead}
        fields={fields}
        onSave={handleSave}
      />

      <FieldManagerDialog
        open={managerOpen}
        onOpenChange={setManagerOpen}
        fields={fields}
        onUpdateField={updateField}
        onDeleteField={deleteField}
        onAddField={addField}
      />

      <ConvertDialog
        open={convertOpen}
        onOpenChange={setConvertOpen}
        lead={convertingLead}
        onConfirm={handleConvert}
      />

      <DuplicateDialog
        open={dupOpen}
        onOpenChange={setDupOpen}
        duplicate={dupMatch}
        matchField={dupField}
        onEditExisting={(lead) => { openEdit(lead); }}
        onCreateAnyway={() => {
          if (pendingData) doSave(pendingData.builtIn, pendingData.customFields);
          setPendingData(null);
        }}
      />
    </div>
  );
}
