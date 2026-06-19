"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { DynamicFieldInput } from "@/components/leads/dynamic-field-input";
import { isProductBuiltIn } from "@/lib/product-field-definitions";
import type { Product } from "@/lib/types";
import type { FieldDefinition } from "@/lib/field-definitions";

type FormState = Record<string, string | number | null>;

function getProductFieldValue(product: Product, fieldId: string): string | number | null {
  if (fieldId === "active") return product.active ? "true" : "false";
  if (isProductBuiltIn(fieldId)) return (product as unknown as Record<string, unknown>)[fieldId] as string | number | null ?? null;
  return product.customFields?.[fieldId] ?? null;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  fields: FieldDefinition[];
  onSave: (data: Partial<Product>) => void;
}

export function ProductFormDialog({
  open, onOpenChange, product, fields, onSave,
}: ProductFormDialogProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const [form, setForm] = useState<FormState>({});

  useEffect(() => {
    if (open) {
      if (product) {
        const state: FormState = {};
        fields.forEach((f) => { state[f.id] = getProductFieldValue(product, f.id); });
        setForm(state);
      } else {
        setForm({ active: "true" });
      }
    }
  }, [open, product, fields]);

  const setField = (fieldId: string) => (val: string | number | null) =>
    setForm((prev) => ({ ...prev, [fieldId]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const builtIn: Partial<Product> = {};
    const customFields: Record<string, string | number | null> = {};

    fields.forEach((f) => {
      const val = form[f.id] ?? null;
      if (f.id === "active") {
        builtIn.active = val === "true";
      } else if (isProductBuiltIn(f.id)) {
        (builtIn as unknown as Record<string, unknown>)[f.id] = val;
      } else {
        customFields[f.id] = val;
      }
    });

    onSave({ ...builtIn, customFields: { ...(product?.customFields ?? {}), ...customFields } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" showCloseButton>
        <DialogHeader>
          <DialogTitle>{product ? t("editProduct") : t("addProduct")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-2">
          {(fields ?? []).map((field) => (
            <div key={field.id} className="grid gap-1.5">
              <label className="text-sm font-medium">
                {field.name}
                {field.required && <span className="text-destructive ms-1">*</span>}
              </label>
              <DynamicFieldInput
                field={field}
                value={form[field.id]}
                onChange={setField(field.id)}
              />
            </div>
          ))}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{tc("cancel")}</Button>
            <Button type="submit">{tc("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
