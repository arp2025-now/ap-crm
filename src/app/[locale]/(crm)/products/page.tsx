"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Settings2, Package } from "lucide-react";
import { FilterBar } from "@/components/leads/filter-bar";
import { ViewsTabs } from "@/components/shared/views-tabs";
import { ProductsTable } from "@/components/products/products-table";
import { ProductFormDialog } from "@/components/products/product-form-dialog";
import { FieldManagerDialog } from "@/components/leads/field-manager-dialog";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/use-products";
import { useProductFields } from "@/hooks/use-product-fields";
import { useProductsSearch } from "@/hooks/use-products-search";
import { useSavedViews } from "@/hooks/use-saved-views";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  const t = useTranslations("products");
  const { products, addProduct, updateProduct, deleteProduct, nextSerial } = useProducts();
  const { fields, addField, updateField, deleteField } = useProductFields();

  const {
    searchText, setSearchText,
    fieldFilters, setFilter, clearFilter, clearAll, applyFilters,
    filteredProducts, activeFilterCount,
  } = useProductsSearch(products, fields);

  const savedViews = useSavedViews("crm-product-views", { searchText, fieldFilters });

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [managerOpen, setManagerOpen] = useState(false);

  const openCreate = () => { setEditingProduct(null); setFormOpen(true); };
  const openEdit = (p: Product) => { setEditingProduct(p); setFormOpen(true); };

  const handleSave = (data: Partial<Product>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      const now = new Date().toISOString();
      addProduct({
        id: `prod-${Date.now()}`,
        serialNumber: nextSerial(),
        name: (data.name as string) ?? "",
        description: (data.description as string) ?? "",
        price: Number(data.price) || 0,
        unit: (data.unit as string) ?? "unit",
        category: (data.category as string) ?? "",
        sku: (data.sku as string) ?? "",
        active: data.active ?? true,
        createdAt: now,
        updatedAt: now,
        createdBy: "אני",
        updatedBy: "אני",
        customFields: data.customFields ?? {},
      });
    }
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
      {/* Blue gradient hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 px-6 py-8 shadow-lg">
        {/* Decorative blur blobs */}
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-10 -start-10 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
              <p className="text-sm text-white/80">{t("subtitle")}</p>
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
              {t("addProduct")}
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

      <ProductsTable
        products={filteredProducts}
        onEdit={openEdit}
        onDelete={deleteProduct}
      />

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
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
