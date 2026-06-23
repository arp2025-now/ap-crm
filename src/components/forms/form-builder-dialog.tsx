"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Trash2, GripVertical, Type, AlignLeft, Hash,
  Mail, Phone, List, CheckSquare, Calendar, Star,
  Link2, Users, UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLeads } from "@/hooks/use-leads";
import { useCustomers } from "@/hooks/use-customers";
import type { WebForm, WebFormField, WebFormFieldType } from "@/lib/types";

const FIELD_TYPE_ICONS: Record<WebFormFieldType, typeof Type> = {
  text: Type,
  textarea: AlignLeft,
  number: Hash,
  email: Mail,
  phone: Phone,
  select: List,
  checkbox: CheckSquare,
  date: Calendar,
  rating: Star,
};

const LEAD_FIELDS = [
  { key: "customerName", label: "שם", labelEn: "Name", type: "text" as WebFormFieldType },
  { key: "customerEmail", label: "אימייל", labelEn: "Email", type: "email" as WebFormFieldType },
  { key: "phone", label: "טלפון", labelEn: "Phone", type: "phone" as WebFormFieldType },
  { key: "company", label: "חברה", labelEn: "Company", type: "text" as WebFormFieldType },
  { key: "notes", label: "הערות", labelEn: "Notes", type: "textarea" as WebFormFieldType },
];

const CUSTOMER_FIELDS = [
  { key: "name", label: "שם", labelEn: "Name", type: "text" as WebFormFieldType },
  { key: "email", label: "אימייל", labelEn: "Email", type: "email" as WebFormFieldType },
  { key: "phone", label: "טלפון", labelEn: "Phone", type: "phone" as WebFormFieldType },
  { key: "company", label: "חברה", labelEn: "Company", type: "text" as WebFormFieldType },
  { key: "industry", label: "תעשייה", labelEn: "Industry", type: "text" as WebFormFieldType },
];

// ---------- Sortable field card ----------

interface SortableFieldCardProps {
  field: WebFormField;
  index: number;
  t: ReturnType<typeof useTranslations<"forms">>;
  optionsText: Record<string, string>;
  onUpdate: (id: string, data: Partial<WebFormField>) => void;
  onRemove: (id: string) => void;
  onOptionsTextChange: (id: string, text: string) => void;
  onOptionsTextBlur: (id: string) => void;
}

function SortableFieldCard({
  field,
  index,
  t,
  optionsText,
  onUpdate,
  onRemove,
  onOptionsTextChange,
  onOptionsTextBlur,
}: SortableFieldCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const FieldIcon = FIELD_TYPE_ICONS[field.type];

  return (
    <div ref={setNodeRef} style={style} className="border rounded-xl p-4 bg-muted/30 space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/50 hover:text-muted-foreground p-0.5"
          aria-label="גרור לשינוי סדר"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <FieldIcon className="h-3.5 w-3.5 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {t(`type${field.type.charAt(0).toUpperCase() + field.type.slice(1)}` as any)}
        </span>
        <span className="text-xs text-muted-foreground ms-auto">#{index + 1}</span>
        <button onClick={() => onRemove(field.id)} className="text-red-400 hover:text-red-600 p-1">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Label + Placeholder */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs">{t("fieldLabel")}</label>
          <Input
            value={field.label}
            onChange={(e) => onUpdate(field.id, { label: e.target.value })}
            className="mt-0.5 h-8 text-sm"
          />
        </div>
        <div>
          <label className="text-xs">{t("fieldPlaceholder")}</label>
          <Input
            value={field.placeholder || ""}
            onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
            className="mt-0.5 h-8 text-sm"
          />
        </div>
      </div>

      {/* Options for select/checkbox */}
      {(field.type === "select" || field.type === "checkbox") && (
        <div>
          <label className="text-xs">{t("fieldOptions")}</label>
          <Input
            value={optionsText[field.id] ?? (field.options || []).join(", ")}
            onChange={(e) => onOptionsTextChange(field.id, e.target.value)}
            onBlur={() => onOptionsTextBlur(field.id)}
            className="mt-0.5 h-8 text-sm"
            placeholder={t("fieldOptionsPlaceholder")}
          />
        </div>
      )}

      {/* Advanced Config */}
      <div className="rounded-lg border border-border bg-muted/20 p-2.5 space-y-2.5">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t("advancedConfig")}</p>

        {field.type !== "rating" && field.type !== "checkbox" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">{t("defaultValue")}</label>
              {field.type === "select" ? (
                <select
                  value={(field.defaultValue as string) ?? ""}
                  onChange={(e) => onUpdate(field.id, { defaultValue: e.target.value || undefined })}
                  className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-xs"
                >
                  <option value="">—</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <Input
                  type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                  value={(field.defaultValue as string) ?? ""}
                  onChange={(e) => onUpdate(field.id, { defaultValue: e.target.value || undefined })}
                  className="mt-0.5 h-7 text-xs"
                  placeholder={t("defaultValue")}
                />
              )}
            </div>

            {(field.type === "text" || field.type === "email") && (
              <div>
                <label className="text-[11px] text-muted-foreground">{t("maxLength")}</label>
                <Input
                  type="number"
                  value={field.maxLength ?? ""}
                  onChange={(e) => onUpdate(field.id, { maxLength: e.target.value ? Number(e.target.value) : undefined })}
                  className="mt-0.5 h-7 text-xs"
                  placeholder="—"
                  min={1}
                />
              </div>
            )}

            {field.type === "textarea" && (
              <div>
                <label className="text-[11px] text-muted-foreground">{t("textareaRows")}</label>
                <select
                  value={field.rows ?? 4}
                  onChange={(e) => onUpdate(field.id, { rows: Number(e.target.value) })}
                  className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-xs"
                >
                  {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>{n} {t("rowsLabel")}</option>
                  ))}
                </select>
              </div>
            )}

            {field.type === "phone" && (
              <div>
                <label className="text-[11px] text-muted-foreground">{t("phoneCountry")}</label>
                <select
                  value={field.phoneCountry ?? "IL"}
                  onChange={(e) => onUpdate(field.id, { phoneCountry: e.target.value })}
                  className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-xs"
                >
                  <option value="IL">🇮🇱 ישראל (+972)</option>
                  <option value="US">🇺🇸 ארה״ב (+1)</option>
                  <option value="GB">🇬🇧 בריטניה (+44)</option>
                  <option value="DE">🇩🇪 גרמניה (+49)</option>
                  <option value="FR">🇫🇷 צרפת (+33)</option>
                  <option value="OTHER">{t("phoneOtherCountry")}</option>
                </select>
              </div>
            )}

            {field.type === "date" && (
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.dateDefaultToday ?? false}
                    onChange={(e) => onUpdate(field.id, { dateDefaultToday: e.target.checked })}
                    className="h-3.5 w-3.5 rounded border-gray-300"
                  />
                  <span className="text-[11px] text-muted-foreground">{t("dateDefaultToday")}</span>
                </label>
              </div>
            )}
          </div>
        )}

        {field.type === "number" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">{t("decimalPlaces")}</label>
              <select
                value={field.numberDecimalPlaces ?? 0}
                onChange={(e) => onUpdate(field.id, { numberDecimalPlaces: Number(e.target.value) })}
                className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-xs"
              >
                <option value={0}>0 — 1,234</option>
                <option value={1}>1 — 1,234.5</option>
                <option value={2}>2 — 1,234.56</option>
                <option value={3}>3 — 1,234.567</option>
                <option value={4}>4 — 1,234.5678</option>
              </select>
            </div>
            <div className="flex items-end pb-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.numberThousandsSeparator ?? false}
                  onChange={(e) => onUpdate(field.id, { numberThousandsSeparator: e.target.checked })}
                  className="h-3.5 w-3.5 rounded border-gray-300"
                />
                <span className="text-[11px] text-muted-foreground">{t("thousandsSeparator")}</span>
              </label>
            </div>
          </div>
        )}

        {field.type === "rating" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">{t("ratingMax")}</label>
              <select
                value={field.ratingMax ?? 5}
                onChange={(e) => onUpdate(field.id, { ratingMax: Number(e.target.value) })}
                className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-xs"
              >
                <option value={3}>3 ★</option>
                <option value={5}>5 ★</option>
                <option value={10}>10 ★</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">{t("defaultValue")}</label>
              <select
                value={(field.defaultValue as number) ?? ""}
                onChange={(e) => onUpdate(field.id, { defaultValue: e.target.value ? Number(e.target.value) : undefined })}
                className="mt-0.5 w-full rounded-md border bg-background px-2 py-1 text-xs"
              >
                <option value="">—</option>
                {Array.from({ length: field.ratingMax ?? 5 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{"★".repeat(n)}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {field.type === "select" && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.selectMultiple ?? false}
              onChange={(e) => onUpdate(field.id, { selectMultiple: e.target.checked })}
              className="h-3.5 w-3.5 rounded border-gray-300"
            />
            <span className="text-[11px] text-muted-foreground">{t("selectMultiple")}</span>
          </label>
        )}
      </div>

      {/* Required toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={field.required}
          onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300"
        />
        <span className="text-xs font-medium">{t("fieldRequired")}</span>
      </label>
    </div>
  );
}

// ---------- Main dialog ----------

interface FormBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (form: Partial<WebForm>) => void;
  initialData?: WebForm | null;
}

export function FormBuilderDialog({
  open,
  onOpenChange,
  onSave,
  initialData,
}: FormBuilderDialogProps) {
  const t = useTranslations("forms");
  const { leads } = useLeads();
  const { customers } = useCustomers();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<WebFormField[]>([]);
  const [linkType, setLinkType] = useState<"none" | "lead" | "customer">("none");
  const [linkedLeadId, setLinkedLeadId] = useState("");
  const [linkedCustomerId, setLinkedCustomerId] = useState("");
  const [optionsText, setOptionsText] = useState<Record<string, string>>({});

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setFields(initialData.fields);
      if (initialData.linkedLeadId) {
        setLinkType("lead");
        setLinkedLeadId(initialData.linkedLeadId);
        setLinkedCustomerId("");
      } else if (initialData.linkedCustomerId) {
        setLinkType("customer");
        setLinkedCustomerId(initialData.linkedCustomerId);
        setLinkedLeadId("");
      } else {
        setLinkType("none");
        setLinkedLeadId("");
        setLinkedCustomerId("");
      }
      const texts: Record<string, string> = {};
      for (const f of initialData.fields) {
        if (f.options && f.options.length > 0) texts[f.id] = f.options.join(", ");
      }
      setOptionsText(texts);
    } else {
      setTitle("");
      setDescription("");
      setFields([]);
      setLinkType("none");
      setLinkedLeadId("");
      setLinkedCustomerId("");
      setOptionsText({});
    }
  }, [initialData, open]);

  const addField = (type: WebFormFieldType) => {
    const newField: WebFormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      label: "",
      placeholder: "",
      required: false,
      options: type === "select" || type === "checkbox" ? [] : undefined,
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const addEntityField = (entityField: { key: string; label: string; type: WebFormFieldType }) => {
    const newField: WebFormField = {
      id: `field-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: entityField.type,
      label: entityField.label,
      placeholder: "",
      required: false,
      options: undefined,
      order: fields.length,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, data: Partial<WebFormField>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...data } : f)));
  };

  const removeField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id).map((f, i) => ({ ...f, order: i })));
    setOptionsText((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleOptionsTextChange = (fieldId: string, text: string) => {
    setOptionsText((prev) => ({ ...prev, [fieldId]: text }));
  };

  const handleOptionsTextBlur = (fieldId: string) => {
    const text = optionsText[fieldId] || "";
    const options = text.split(",").map((s) => s.trim()).filter(Boolean);
    updateField(fieldId, { options });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    setFields(arrayMove(fields, oldIndex, newIndex).map((f, i) => ({ ...f, order: i })));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const finalFields = fields.map((f) => {
      if (f.type === "select" || f.type === "checkbox") {
        const text = optionsText[f.id] || "";
        const options = text.split(",").map((s) => s.trim()).filter(Boolean);
        return { ...f, options };
      }
      return f;
    });
    const linkedLead = linkType === "lead" ? leads.find((l) => l.id === linkedLeadId) : null;
    const linkedCustomer = linkType === "customer" ? customers.find((c) => c.id === linkedCustomerId) : null;
    onSave({
      title,
      description,
      fields: finalFields,
      linkedLeadId: linkedLead?.id,
      linkedLeadName: linkedLead?.customerName,
      linkedCustomerId: linkedCustomer?.id,
      linkedCustomerName: linkedCustomer?.name,
    });
    onOpenChange(false);
  };

  const fieldTypes: WebFormFieldType[] = [
    "text", "textarea", "number", "email", "phone", "select", "checkbox", "date", "rating",
  ];

  const entityFields = linkType === "lead" ? LEAD_FIELDS : linkType === "customer" ? CUSTOMER_FIELDS : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? t("editForm") : t("addForm")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold">{t("formTitle")}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-semibold">{t("formDescription")}</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("formDescriptionPlaceholder")}
                rows={2}
                className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Entity Linking */}
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="h-4 w-4 text-primary" />
              <label className="text-sm font-semibold text-primary">{t("linkEntity")}</label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setLinkType("none"); setLinkedLeadId(""); setLinkedCustomerId(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  linkType === "none"
                    ? "bg-muted border-border text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {t("linkNone")}
              </button>
              <button
                onClick={() => { setLinkType("lead"); setLinkedCustomerId(""); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  linkType === "lead"
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                {t("linkLead")}
              </button>
              <button
                onClick={() => { setLinkType("customer"); setLinkedLeadId(""); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  linkType === "customer"
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                {t("linkCustomer")}
              </button>
            </div>

            {linkType === "lead" && (
              <select
                value={linkedLeadId}
                onChange={(e) => setLinkedLeadId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t("selectLead")}</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.customerName} {lead.company ? `(${lead.company})` : ""}
                  </option>
                ))}
              </select>
            )}

            {linkType === "customer" && (
              <select
                value={linkedCustomerId}
                onChange={(e) => setLinkedCustomerId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">{t("selectCustomer")}</option>
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} {cust.company ? `(${cust.company})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Entity Fields */}
          {linkType !== "none" && entityFields.length > 0 && (
            <div>
              <label className="text-sm font-semibold mb-2 block">{t("entityFields")}</label>
              <div className="flex flex-wrap gap-2">
                {entityFields.map((ef) => {
                  const Icon = FIELD_TYPE_ICONS[ef.type];
                  return (
                    <button
                      key={ef.key}
                      onClick={() => addEntityField(ef)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 hover:border-primary/50 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {ef.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Field Type Selector */}
          <div>
            <label className="text-sm font-semibold mb-2 block">{t("addField")}</label>
            <div className="flex flex-wrap gap-2">
              {fieldTypes.map((type) => {
                const Icon = FIELD_TYPE_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => addField(type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-primary/30 text-primary text-xs font-medium hover:bg-primary/5 hover:border-primary/50 transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t(`type${type.charAt(0).toUpperCase() + type.slice(1)}` as any)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fields List — drag and drop */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {fields.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">{t("noFields")}</p>
                    <p className="text-xs">{t("noFieldsHint")}</p>
                  </div>
                )}
                {fields.map((field, index) => (
                  <SortableFieldCard
                    key={field.id}
                    field={field}
                    index={index}
                    t={t}
                    optionsText={optionsText}
                    onUpdate={updateField}
                    onRemove={removeField}
                    onOptionsTextChange={handleOptionsTextChange}
                    onOptionsTextBlur={handleOptionsTextBlur}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
