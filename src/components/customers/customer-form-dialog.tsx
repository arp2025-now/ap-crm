"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { DynamicFieldInput } from "@/components/leads/dynamic-field-input";
import { isCustomerBuiltIn } from "@/lib/customer-field-definitions";
import type { Customer } from "@/lib/types";
import type { FieldDefinition } from "@/lib/field-definitions";

type FormState = Record<string, string | number | null>;

function getCustomerFieldValue(customer: Customer, fieldId: string): string | number | null {
  if (isCustomerBuiltIn(fieldId)) return (customer as unknown as Record<string, unknown>)[fieldId] as string | number | null ?? null;
  return customer.customFields?.[fieldId] ?? null;
}

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  fields: FieldDefinition[];
  onSave: (data: Partial<Customer>) => void;
}

export function CustomerFormDialog({
  open, onOpenChange, customer, fields, onSave,
}: CustomerFormDialogProps) {
  const t = useTranslations("customers");
  const tc = useTranslations("common");
  const [form, setForm] = useState<FormState>({});

  useEffect(() => {
    if (open) {
      if (customer) {
        const state: FormState = {};
        fields.forEach((f) => { state[f.id] = getCustomerFieldValue(customer, f.id); });
        setForm(state);
      } else {
        setForm({});
      }
    }
  }, [open, customer, fields]);

  const setField = (fieldId: string) => (val: string | number | null) =>
    setForm((prev) => ({ ...prev, [fieldId]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const builtIn: Partial<Customer> = {};
    const customFields: Record<string, string | number | null> = {};

    fields.forEach((f) => {
      const val = form[f.id] ?? null;
      if (isCustomerBuiltIn(f.id)) {
        (builtIn as Record<string, unknown>)[f.id] = val;
      } else {
        customFields[f.id] = val;
      }
    });

    onSave({ ...builtIn, customFields: { ...(customer?.customFields ?? {}), ...customFields } });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto" showCloseButton>
        <DialogHeader>
          <DialogTitle>{customer ? t("editCustomer") : t("addCustomer")}</DialogTitle>
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
