"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { DynamicFieldInput } from "./dynamic-field-input";
import { isBuiltIn } from "@/lib/field-definitions";
import { formatDate } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import type { FieldDefinition } from "@/lib/field-definitions";
import { useCustomFieldDefinitions } from "@/hooks/use-custom-field-definitions";
import { useCustomFieldValues } from "@/hooks/use-custom-field-values";
import { CustomFieldsSection } from "@/components/custom-fields/custom-fields-section";

type FormState = Record<string, string | number | null>;

function getFieldValue(lead: Lead, fieldId: string): string | number | null {
  if (isBuiltIn(fieldId)) return (lead as unknown as Record<string, unknown>)[fieldId] as string | number | null ?? null;
  return lead.customFields?.[fieldId] ?? null;
}

function buildFormState(lead: Lead | null | undefined, fields: FieldDefinition[]): FormState {
  if (!lead) return {};
  return Object.fromEntries(
    fields.map((f) => [f.id, getFieldValue(lead, f.id)])
  );
}

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  fields: FieldDefinition[];
  onSave: (builtIn: Partial<Lead>, customFields: Record<string, string | number | null>) => void;
}

export function LeadFormDialog({ open, onOpenChange, lead, fields, onSave }: LeadFormDialogProps) {
  const t = useTranslations("leads");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [form, setForm] = useState<FormState>({});

  // Custom fields
  const { fields: customDefs } = useCustomFieldDefinitions('lead')
  const { values: cfValues, setValue: setCfValue, saveAll: saveCfAll } = useCustomFieldValues(
    lead?.id ?? '',
    'lead'
  )

  useEffect(() => {
    if (open) setForm(buildFormState(lead, fields));
  }, [open, lead, fields]);

  const setField = (fieldId: string) => (val: string | number | null) =>
    setForm((prev) => ({ ...prev, [fieldId]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const builtIn: Partial<Lead> = {};
    const customFields: Record<string, string | number | null> = {};

    fields.forEach((f) => {
      const val = form[f.id] ?? null;
      if (isBuiltIn(f.id)) {
        (builtIn as Record<string, unknown>)[f.id] = val;
      } else {
        customFields[f.id] = val;
      }
    });

    onSave(builtIn, customFields);
    // Save custom field values for existing leads only.
    // For new leads (no lead?.id), custom fields can be filled after first save.
    if (lead?.id) {
      saveCfAll(customDefs).catch(console.error);
    }
    onOpenChange(false);
  };

  const isEdit = !!lead;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" showCloseButton>
        <DialogHeader>
          <DialogTitle>{isEdit ? t("editLead") : t("addLead")}</DialogTitle>
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

          {/* Custom fields section */}
          <CustomFieldsSection
            entityType="lead"
            definitions={customDefs}
            values={cfValues}
            onChangeValue={setCfValue}
          />

          {/* Metadata section — edit mode only */}
          {isEdit && lead && (
            <div className="mt-2 rounded-lg border bg-muted/40 p-3 grid gap-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {t("metadataSection")}
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
                <MetaRow label={t("metaSerial")} value={String(lead.serialNumber ?? "—")} />
                <MetaRow label={t("metaId")} value={lead.id} />
                <MetaRow label={t("metaCreatedAt")} value={formatDate(lead.createdAt, locale === "he" ? "he-IL" : "en-US")} />
                <MetaRow label={t("metaUpdatedAt")} value={formatDate(lead.updatedAt, locale === "he" ? "he-IL" : "en-US")} />
                <MetaRow label={t("metaCreatedBy")} value={lead.createdBy ?? "—"} />
                <MetaRow label={t("metaUpdatedBy")} value={lead.updatedBy ?? "—"} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tc("cancel")}
            </Button>
            <Button type="submit">{tc("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium font-mono">{value}</span>
    </div>
  );
}
