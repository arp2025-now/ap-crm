"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Settings2, Users } from "lucide-react";
import { FilterBar } from "@/components/leads/filter-bar";
import { ViewsTabs } from "@/components/shared/views-tabs";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog";
import { FieldManagerDialog } from "@/components/leads/field-manager-dialog";
import { Button } from "@/components/ui/button";
import { useCustomers } from "@/hooks/use-customers";
import { useCustomerFields } from "@/hooks/use-customer-fields";
import { useCustomersSearch } from "@/hooks/use-customers-search";
import { useSavedViews } from "@/hooks/use-saved-views";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const t = useTranslations("customers");
  const { customers, addCustomer, updateCustomer, deleteCustomer, nextSerial } = useCustomers();
  const { fields, addField, updateField, deleteField } = useCustomerFields();

  const {
    searchText, setSearchText,
    fieldFilters, setFilter, clearFilter, clearAll, applyFilters,
    filteredCustomers, activeFilterCount,
  } = useCustomersSearch(customers, fields);

  const savedViews = useSavedViews("crm-customer-views", { searchText, fieldFilters });

  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);

  const openCreate = () => { setEditingCustomer(null); setFormOpen(true); };
  const openEdit = (c: Customer) => { setEditingCustomer(c); setFormOpen(true); };

  const handleSave = (data: Partial<Customer>) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data);
    } else {
      const now = new Date().toISOString();
      addCustomer({
        id: `cust-${Date.now()}`,
        serialNumber: nextSerial(),
        name: data.name ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        company: data.company ?? "",
        industry: data.industry ?? "",
        assignedAgentId: "agent-1",
        tags: [],
        sentimentScore: 0,
        lifetimeValue: data.lifetimeValue ?? 0,
        healthGrade: "—",
        lifecycleStage: data.lifecycleStage ?? "prospect",
        createdAt: now,
        updatedAt: now,
        createdBy: "אני",
        updatedBy: "אני",
        customFields: {},
      });
    }
  };

  // Apply a saved view
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
      {/* Blue gradient hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 px-6 py-8 shadow-lg">
        {/* Decorative blur blobs */}
        <div className="pointer-events-none absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -start-10 h-32 w-32 rounded-full bg-indigo-400/20 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Users className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
              <p className="text-sm text-blue-100">{t("subtitle")}</p>
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
              onClick={openCreate}
              className="bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-lg"
            >
              <Plus className="h-4 w-4 me-2" />
              {t("addCustomer")}
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

      <CustomersTable
        customers={filteredCustomers}
        onEdit={openEdit}
        onDelete={deleteCustomer}
      />

      <CustomerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        customer={editingCustomer}
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
    </div>
  );
}
