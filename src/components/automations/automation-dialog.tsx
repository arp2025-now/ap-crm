"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Plus, Trash2, ArrowDown, Zap, Clock, MousePointerClick,
  RefreshCw, Mail, Pencil, ListPlus, FilePlus, Bell, Webhook,
  CheckSquare, ChevronDown, DollarSign, AlertTriangle, Target, Receipt, FileSpreadsheet, MessageSquare, Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import type {
  Automation, AutomationTrigger, AutomationAction, AutomationStep,
  AutomationTriggerConfig, AutomationActionConfig,
  AutomationCondition, AutomationConditionOperator,
} from "@/lib/types";

// ── Entity field definitions ──
interface EntityFieldDef {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  options?: string[];
}

const LEAD_FIELDS: EntityFieldDef[] = [
  { key: "customerName", label: "שם", type: "text" },
  { key: "customerEmail", label: "אימייל", type: "text" },
  { key: "phone", label: "טלפון", type: "text" },
  { key: "company", label: "חברה", type: "text" },
  { key: "status", label: "סטטוס", type: "select", options: ["new", "contacted", "qualified", "proposal", "negotiation", "converted", "lost"] },
  { key: "heatLevel", label: "רמת חום", type: "select", options: ["hot", "warm", "cold"] },
  { key: "pipelineValue", label: "שווי עסקה", type: "number" },
  { key: "notes", label: "הערות", type: "text" },
  { key: "assignedAgentId", label: "סוכן אחראי", type: "text" },
];

const CUSTOMER_FIELDS: EntityFieldDef[] = [
  { key: "name", label: "שם", type: "text" },
  { key: "email", label: "אימייל", type: "text" },
  { key: "phone", label: "טלפון", type: "text" },
  { key: "company", label: "חברה", type: "text" },
  { key: "industry", label: "תעשייה", type: "text" },
  { key: "lifecycleStage", label: "שלב", type: "select", options: ["active", "churned", "vip"] },
  { key: "tags", label: "תגיות", type: "text" },
  { key: "assignedAgentId", label: "סוכן אחראי", type: "text" },
];

const QUOTE_FIELDS: EntityFieldDef[] = [
  { key: "status", label: "סטטוס", type: "select", options: ["draft", "sent", "viewed", "signed", "rejected", "expired"] },
  { key: "customerName", label: "שם לקוח", type: "text" },
  { key: "total", label: "סה\"כ", type: "number" },
  { key: "validUntil", label: "בתוקף עד", type: "date" },
  { key: "notes", label: "הערות", type: "text" },
  { key: "terms", label: "תנאים", type: "text" },
  { key: "includeVat", label: "כולל מע\"מ", type: "select", options: ["true", "false"] },
  { key: "globalDiscount", label: "הנחה כללית (%)", type: "number" },
];

const TASK_FIELDS: EntityFieldDef[] = [
  { key: "title", label: "כותרת", type: "text" },
  { key: "status", label: "סטטוס", type: "select", options: ["todo", "in_progress", "done"] },
  { key: "priority", label: "עדיפות", type: "select", options: ["low", "medium", "high"] },
  { key: "dueDate", label: "תאריך יעד", type: "date" },
  { key: "description", label: "תיאור", type: "text" },
];

const ENTITY_FIELDS: Record<string, EntityFieldDef[]> = {
  lead: LEAD_FIELDS,
  customer: CUSTOMER_FIELDS,
  quote: QUOTE_FIELDS,
  task: TASK_FIELDS,
};

// ── Trigger categories ──
const TRIGGER_GROUPS = [
  {
    category: "events",
    triggers: [
      "lead_created", "lead_updated", "lead_converted",
      "customer_created", "quote_sent", "quote_signed",
      "deal_won", "deal_lost",
    ] as AutomationTrigger[],
  },
  {
    category: "finance",
    triggers: ["payment_received", "invoice_overdue", "budget_exceeded", "expense_created"] as AutomationTrigger[],
  },
  {
    category: "advanced",
    triggers: ["field_changed", "scheduled", "button_click"] as AutomationTrigger[],
  },
];

const ACTIONS: AutomationAction[] = [
  "send_whatsapp", "score_lead_ai", "send_email", "create_task", "notify",
  "update_field", "send_webhook", "create_instance", "create_field",
  "sync_accounting", "create_invoice",
];

const TRIGGER_KEYS: Record<AutomationTrigger, string> = {
  lead_created: "triggerLeadCreated",
  lead_updated: "triggerLeadUpdated",
  lead_converted: "triggerLeadConverted",
  customer_created: "triggerCustomerCreated",
  quote_sent: "triggerQuoteSent",
  quote_signed: "triggerQuoteSigned",
  deal_won: "triggerDealWon",
  deal_lost: "triggerDealLost",
  field_changed: "triggerFieldChanged",
  scheduled: "triggerScheduled",
  button_click: "triggerButtonClick",
  payment_received: "triggerPaymentReceived",
  invoice_overdue: "triggerInvoiceOverdue",
  budget_exceeded: "triggerBudgetExceeded",
  expense_created: "triggerExpenseCreated",
};

const ACTION_KEYS: Record<AutomationAction, string> = {
  send_webhook: "actionSendWebhook",
  send_email: "actionSendEmail",
  update_field: "actionUpdateField",
  create_task: "actionCreateTask",
  notify: "actionNotify",
  create_instance: "actionCreateInstance",
  create_field: "actionCreateField",
  sync_accounting: "actionSyncAccounting",
  create_invoice: "actionCreateInvoice",
  send_whatsapp: "actionSendWhatsapp",
  score_lead_ai: "actionScoreLeadAI",
};

// Hebrew labels for actions
const ACTION_LABELS_HE: Partial<Record<AutomationAction, string>> = {
  send_whatsapp: "שלח WhatsApp",
  score_lead_ai: "ניקוד ליד AI",
};

const TRIGGER_ICONS: Record<string, typeof Zap> = {
  lead_created: Zap,
  lead_updated: RefreshCw,
  lead_converted: Zap,
  customer_created: Zap,
  quote_sent: Mail,
  quote_signed: Zap,
  deal_won: Zap,
  deal_lost: Zap,
  field_changed: Pencil,
  scheduled: Clock,
  button_click: MousePointerClick,
  payment_received: DollarSign,
  invoice_overdue: AlertTriangle,
  budget_exceeded: Target,
  expense_created: Receipt,
};

const ACTION_ICONS: Record<AutomationAction, typeof Zap> = {
  update_field: Pencil,
  create_instance: ListPlus,
  create_field: FilePlus,
  send_email: Mail,
  send_webhook: Webhook,
  create_task: CheckSquare,
  notify: Bell,
  sync_accounting: FileSpreadsheet,
  create_invoice: Receipt,
  send_whatsapp: MessageSquare,
  score_lead_ai: Zap,
};

const ACTION_COLORS: Record<AutomationAction, string> = {
  update_field: "bg-amber-100 text-amber-700 border-amber-200",
  create_instance: "bg-violet-100 text-violet-700 border-violet-200",
  create_field: "bg-indigo-100 text-indigo-700 border-indigo-200",
  send_email: "bg-sky-100 text-sky-700 border-sky-200",
  send_webhook: "bg-emerald-100 text-emerald-700 border-emerald-200",
  create_task: "bg-blue-100 text-blue-700 border-blue-200",
  notify: "bg-rose-100 text-rose-700 border-rose-200",
  sync_accounting: "bg-teal-100 text-teal-700 border-teal-200",
  create_invoice: "bg-orange-100 text-orange-700 border-orange-200",
  send_whatsapp: "bg-green-100 text-green-700 border-green-200",
  score_lead_ai: "bg-purple-100 text-purple-700 border-purple-200",
};

// Condition operators
const OPERATOR_LABELS: Record<AutomationConditionOperator, string> = {
  equals: "שווה ל",
  not_equals: "לא שווה ל",
  contains: "מכיל",
  not_contains: "לא מכיל",
  is_empty: "ריק",
  is_not_empty: "לא ריק",
};
const OPERATORS_WITH_VALUE: AutomationConditionOperator[] = ["equals", "not_equals", "contains", "not_contains"];

// Helper: get status label in Hebrew
const STATUS_LABELS: Record<string, string> = {
  new: "חדש", contacted: "פנייה ראשונה", qualified: "מתאים", proposal: "הצעה",
  negotiation: "משא ומתן", converted: "הומר", lost: "אבד",
  hot: "חם", warm: "חמים", cold: "קר",
  active: "פעיל", churned: "נטש", vip: "VIP",
  draft: "טיוטה", sent: "נשלח", viewed: "נצפה", signed: "נחתם", rejected: "נדחה", expired: "פג תוקף",
  todo: "לביצוע", in_progress: "בתהליך", done: "הושלם",
  low: "נמוכה", medium: "בינונית", high: "גבוהה",
  true: "כן", false: "לא",
};

interface AutomationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  automation: Automation | null;
  onSave: (data: Partial<Automation>) => void;
}

export function AutomationDialog({ open, onOpenChange, automation, onSave }: AutomationDialogProps) {
  const t = useTranslations("automations");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [trigger, setTrigger] = useState<AutomationTrigger>("lead_created");
  const [triggerConfig, setTriggerConfig] = useState<AutomationTriggerConfig>({});
  const [steps, setSteps] = useState<AutomationStep[]>([]);
  const [active, setActive] = useState(true);
  const [showAddAction, setShowAddAction] = useState(false);

  useEffect(() => {
    if (automation) {
      setName(automation.name);
      setDescription(automation.description);
      setTrigger(automation.trigger);
      setTriggerConfig(automation.triggerConfig ?? {});
      setSteps([...automation.steps]);
      setActive(automation.active);
    } else {
      setName("");
      setDescription("");
      setTrigger("lead_created");
      setTriggerConfig({});
      setSteps([]);
      setActive(true);
    }
    setShowAddAction(false);
  }, [automation, open]);

  const addStep = (action: AutomationAction) => {
    setSteps([...steps, { id: `step-${Date.now()}`, action, config: {} }]);
    setShowAddAction(false);
  };

  const updateStepAction = (index: number, action: AutomationAction) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], action, config: {} };
    setSteps(updated);
  };

  const updateStepConfig = (index: number, key: string, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], config: { ...updated[index].config, [key]: value } };
    setSteps(updated);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), trigger, triggerConfig, steps, active });
  };

  // Get fields for a given entity
  const getFieldsForEntity = (entity: string): EntityFieldDef[] => {
    return ENTITY_FIELDS[entity] || [];
  };

  // Get the selected field definition
  const getFieldDef = (entity: string, fieldKey: string): EntityFieldDef | undefined => {
    return getFieldsForEntity(entity).find((f) => f.key === fieldKey);
  };

  const TriggerIcon = TRIGGER_ICONS[trigger] ?? Zap;

  // Render the value input — either a dropdown (for select fields) or a text/number/date input
  const renderValueInput = (
    entity: string,
    fieldKey: string,
    value: string,
    onChange: (val: string) => void,
    placeholder: string,
  ) => {
    const fieldDef = getFieldDef(entity, fieldKey);
    if (fieldDef?.type === "select" && fieldDef.options) {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
        >
          <option value="">{placeholder}</option>
          {fieldDef.options.map((opt) => (
            <option key={opt} value={opt}>{STATUS_LABELS[opt] || opt}</option>
          ))}
        </select>
      );
    }
    return (
      <input
        type={fieldDef?.type === "number" ? "number" : fieldDef?.type === "date" ? "date" : "text"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
        placeholder={placeholder}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/15 flex items-center justify-center">
              <Zap className="h-4 w-4 text-blue-600" />
            </div>
            {automation ? t("editAutomation") : t("automationBuilder")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Name & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("automationName")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("automationName")}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("automationDesc")}</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* ── TRIGGER SECTION ── */}
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-100/80 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-800">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <TriggerIcon className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-sm text-blue-800 dark:text-blue-300">{t("triggerSection")}</span>
            </div>

            <div className="p-4 space-y-3">
              <select
                value={trigger}
                onChange={(e) => { setTrigger(e.target.value as AutomationTrigger); setTriggerConfig({}); }}
                className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all font-medium"
              >
                <optgroup label="אירועים">
                  {TRIGGER_GROUPS[0].triggers.map((tr) => (
                    <option key={tr} value={tr}>{t(TRIGGER_KEYS[tr])}</option>
                  ))}
                </optgroup>
                <optgroup label="פיננסים">
                  {TRIGGER_GROUPS[1].triggers.map((tr) => (
                    <option key={tr} value={tr}>{t(TRIGGER_KEYS[tr])}</option>
                  ))}
                </optgroup>
                <optgroup label="מתקדם">
                  {TRIGGER_GROUPS[2].triggers.map((tr) => (
                    <option key={tr} value={tr}>{t(TRIGGER_KEYS[tr])}</option>
                  ))}
                </optgroup>
              </select>

              {/* field_changed config */}
              {trigger === "field_changed" && (
                <div className="rounded-xl border bg-white dark:bg-background p-3 space-y-3">
                  <p className="text-xs font-semibold text-blue-600">{t("whenFieldChanges")}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t("entityType")}</label>
                      <select
                        value={triggerConfig.entity ?? ""}
                        onChange={(e) => setTriggerConfig({ ...triggerConfig, entity: e.target.value, field: "", toValue: "" })}
                        className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                      >
                        <option value="">{t("entityType")}</option>
                        <option value="lead">{t("entityLead")}</option>
                        <option value="customer">{t("entityCustomer")}</option>
                        <option value="quote">{t("entityQuote")}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t("fieldName")}</label>
                      {triggerConfig.entity ? (
                        <select
                          value={triggerConfig.field ?? ""}
                          onChange={(e) => setTriggerConfig({ ...triggerConfig, field: e.target.value, toValue: "" })}
                          className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                        >
                          <option value="">{t("selectField")}</option>
                          {getFieldsForEntity(triggerConfig.entity).map((f) => (
                            <option key={f.key} value={f.key}>{f.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={triggerConfig.field ?? ""}
                          onChange={(e) => setTriggerConfig({ ...triggerConfig, field: e.target.value })}
                          className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                          placeholder={t("fieldName")}
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t("toValue")}</label>
                      {triggerConfig.entity && triggerConfig.field ? (
                        renderValueInput(
                          triggerConfig.entity,
                          triggerConfig.field,
                          triggerConfig.toValue ?? "",
                          (val) => setTriggerConfig({ ...triggerConfig, toValue: val }),
                          t("toValue"),
                        )
                      ) : (
                        <input
                          value={triggerConfig.toValue ?? ""}
                          onChange={(e) => setTriggerConfig({ ...triggerConfig, toValue: e.target.value })}
                          className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                          placeholder={t("toValue")}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* scheduled config */}
              {trigger === "scheduled" && (
                <div className="rounded-xl border bg-white dark:bg-background p-3 space-y-3">
                  <p className="text-xs font-semibold text-blue-600">{t("atScheduledTime")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t("scheduleType")}</label>
                      <select
                        value={triggerConfig.scheduleType ?? "daily"}
                        onChange={(e) => setTriggerConfig({ ...triggerConfig, scheduleType: e.target.value as "daily" | "weekly" | "monthly" | "custom" })}
                        className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                      >
                        <option value="daily">{t("daily")}</option>
                        <option value="weekly">{t("weekly")}</option>
                        <option value="monthly">{t("monthly")}</option>
                        <option value="custom">{t("custom")}</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">{t("scheduleTime")}</label>
                      <input
                        type="time"
                        value={triggerConfig.scheduleTime ?? "09:00"}
                        onChange={(e) => setTriggerConfig({ ...triggerConfig, scheduleTime: e.target.value })}
                        className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* button_click config */}
              {trigger === "button_click" && (
                <div className="rounded-xl border bg-white dark:bg-background p-3 space-y-3">
                  <p className="text-xs font-semibold text-blue-600">{t("onButtonClick")}</p>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">{t("buttonLabel")}</label>
                    <input
                      value={triggerConfig.buttonLabel ?? ""}
                      onChange={(e) => setTriggerConfig({ ...triggerConfig, buttonLabel: e.target.value })}
                      className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                      placeholder={t("buttonLabel")}
                    />
                  </div>
                </div>
              )}

              {/* lead_updated — watched fields */}
              {trigger === "lead_updated" && (
                <div className="rounded-xl border bg-white dark:bg-background p-3 space-y-2">
                  <p className="text-xs font-semibold text-blue-600">הפעל רק כשמשתנה אחד מהשדות</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {LEAD_FIELDS.map((f) => {
                      const watched = triggerConfig.watchedFields ?? [];
                      const checked = watched.includes(f.key);
                      return (
                        <label
                          key={f.key}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer text-xs transition-colors select-none ${
                            checked ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600" : "border-muted hover:bg-muted/50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const current = triggerConfig.watchedFields ?? [];
                              setTriggerConfig({
                                ...triggerConfig,
                                watchedFields: e.target.checked
                                  ? [...current, f.key]
                                  : current.filter((k) => k !== f.key),
                              });
                            }}
                            className="w-3 h-3 accent-blue-600"
                          />
                          {f.label}
                        </label>
                      );
                    })}
                  </div>
                  {(triggerConfig.watchedFields ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground">ללא סינון — יופעל על כל שינוי בליד</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── CONDITIONS / FILTERS SECTION ── */}
          {(() => {
            const conditions: AutomationCondition[] = (triggerConfig.conditions as AutomationCondition[] | undefined) ?? [];
            const addCondition = () => {
              setTriggerConfig({
                ...triggerConfig,
                conditions: [...conditions, { field: "status", operator: "equals", value: "" }],
              });
            };
            const updateCondition = (idx: number, updates: Partial<AutomationCondition>) => {
              const updated = conditions.map((c, i) => (i === idx ? { ...c, ...updates } : c));
              setTriggerConfig({ ...triggerConfig, conditions: updated });
            };
            const removeCondition = (idx: number) => {
              setTriggerConfig({ ...triggerConfig, conditions: conditions.filter((_, i) => i !== idx) });
            };
            return (
              <div className="rounded-2xl border-2 border-violet-200 bg-violet-50/50 dark:bg-violet-950/20 dark:border-violet-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-violet-100/80 dark:bg-violet-900/30 border-b border-violet-200 dark:border-violet-800">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-violet-600 flex items-center justify-center">
                      <Filter className="h-3 w-3 text-white" />
                    </div>
                    <span className="font-bold text-xs text-violet-800 dark:text-violet-300">
                      פילטרים — הפעל רק כאשר
                      {conditions.length > 0 && <span className="ml-1 font-normal">({conditions.length})</span>}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addCondition}
                    className="h-6 px-2 text-xs text-violet-600 hover:bg-violet-200/50"
                  >
                    <Plus className="h-3 w-3 me-1" />
                    הוסף תנאי
                  </Button>
                </div>
                <div className="p-3 space-y-2">
                  {conditions.length === 0 ? (
                    <p className="text-xs text-center text-muted-foreground py-1">ללא פילטרים — האוטומציה תופעל תמיד</p>
                  ) : (
                    conditions.map((cond, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 flex-wrap">
                        {idx > 0 && <span className="text-xs text-muted-foreground w-full ps-1">וגם</span>}
                        <select
                          value={cond.field}
                          onChange={(e) => updateCondition(idx, { field: e.target.value, value: "" })}
                          className="rounded-lg border bg-background px-2 py-1.5 text-xs flex-1 min-w-0"
                        >
                          {LEAD_FIELDS.map((f) => (
                            <option key={f.key} value={f.key}>{f.label}</option>
                          ))}
                        </select>
                        <select
                          value={cond.operator}
                          onChange={(e) => updateCondition(idx, { operator: e.target.value as AutomationConditionOperator })}
                          className="rounded-lg border bg-background px-2 py-1.5 text-xs"
                        >
                          {(Object.keys(OPERATOR_LABELS) as AutomationConditionOperator[]).map((op) => (
                            <option key={op} value={op}>{OPERATOR_LABELS[op]}</option>
                          ))}
                        </select>
                        {OPERATORS_WITH_VALUE.includes(cond.operator) && (
                          <input
                            value={cond.value ?? ""}
                            onChange={(e) => updateCondition(idx, { value: e.target.value })}
                            className="rounded-lg border bg-background px-2 py-1.5 text-xs w-24"
                            placeholder="ערך"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive/60 hover:text-destructive flex-shrink-0"
                          onClick={() => removeCondition(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── CONNECTOR ── */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center">
              <div className="h-6 w-0.5 bg-gradient-to-b from-blue-400 to-emerald-400" />
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-md">
                <ArrowDown className="h-3 w-3 text-white" />
              </div>
              <div className="h-6 w-0.5 bg-gradient-to-b from-emerald-400 to-emerald-300" />
            </div>
          </div>

          {/* ── ACTIONS SECTION ── */}
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-emerald-100/80 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <Zap className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="font-bold text-sm text-emerald-800 dark:text-emerald-300">{t("actionSection")}</span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {steps.length === 0 && !showAddAction && (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-2">
                    <Plus className="h-5 w-5 text-emerald-500" />
                  </div>
                  {t("noStepsYet")}
                </div>
              )}

              {steps.map((step, i) => {
                const AIcon = ACTION_ICONS[step.action];
                const colorClass = ACTION_COLORS[step.action];
                const cfg = step.config as Record<string, string | undefined>;
                const entityFields = cfg.entity ? getFieldsForEntity(cfg.entity) : [];
                return (
                  <div key={step.id} className="rounded-xl border bg-white dark:bg-background shadow-sm overflow-hidden">
                    {/* Step header */}
                    <div className={`flex items-center justify-between px-3 py-2 border-b ${colorClass}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{i + 1}</span>
                        <AIcon className="h-3.5 w-3.5" />
                        <select
                          value={step.action}
                          onChange={(e) => updateStepAction(i, e.target.value as AutomationAction)}
                          className="bg-transparent text-xs font-semibold border-none focus:ring-0 cursor-pointer"
                        >
                          {ACTIONS.map((act) => (
                            <option key={act} value={act}>{ACTION_LABELS_HE[act] ?? t(ACTION_KEYS[act])}</option>
                          ))}
                        </select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive/60 hover:text-destructive"
                        onClick={() => removeStep(i)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Step config */}
                    <div className="p-3">
                      {step.action === "update_field" && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{t("entityType")}</label>
                            <select
                              value={cfg.entity ?? ""}
                              onChange={(e) => {
                                const updated = [...steps];
                                updated[i] = { ...updated[i], config: { entity: e.target.value, field: "", value: "" } };
                                setSteps(updated);
                              }}
                              className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                            >
                              <option value="">{t("entityType")}</option>
                              <option value="lead">{t("entityLead")}</option>
                              <option value="customer">{t("entityCustomer")}</option>
                              <option value="quote">{t("entityQuote")}</option>
                              <option value="task">{t("entityTask")}</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{t("fieldName")}</label>
                            {entityFields.length > 0 ? (
                              <select
                                value={cfg.field ?? ""}
                                onChange={(e) => updateStepConfig(i, "field", e.target.value)}
                                className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                              >
                                <option value="">{t("selectField")}</option>
                                {entityFields.map((f) => (
                                  <option key={f.key} value={f.key}>{f.label}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                value={cfg.field ?? ""}
                                onChange={(e) => updateStepConfig(i, "field", e.target.value)}
                                className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                                placeholder={t("fieldName")}
                              />
                            )}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{t("fieldValue")}</label>
                            {cfg.entity && cfg.field ? (
                              renderValueInput(
                                cfg.entity,
                                cfg.field,
                                cfg.value ?? "",
                                (val) => updateStepConfig(i, "value", val),
                                t("fieldValue"),
                              )
                            ) : (
                              <input
                                value={cfg.value ?? ""}
                                onChange={(e) => updateStepConfig(i, "value", e.target.value)}
                                className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                                placeholder={t("fieldValue")}
                              />
                            )}
                          </div>
                        </div>
                      )}

                      {step.action === "create_instance" && (
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">{t("instanceType")}</label>
                          <select
                            value={cfg.instanceType ?? ""}
                            onChange={(e) => updateStepConfig(i, "instanceType", e.target.value)}
                            className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                          >
                            <option value="">{t("instanceType")}</option>
                            <option value="lead">{t("entityLead")}</option>
                            <option value="customer">{t("entityCustomer")}</option>
                            <option value="task">{t("entityTask")}</option>
                            <option value="quote">{t("entityQuote")}</option>
                          </select>
                        </div>
                      )}

                      {step.action === "create_field" && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{t("entityType")}</label>
                            <select
                              value={cfg.entity ?? ""}
                              onChange={(e) => updateStepConfig(i, "entity", e.target.value)}
                              className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                            >
                              <option value="">{t("entityType")}</option>
                              <option value="lead">{t("entityLead")}</option>
                              <option value="customer">{t("entityCustomer")}</option>
                              <option value="quote">{t("entityQuote")}</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{t("fieldName")}</label>
                            <input
                              value={cfg.fieldName ?? ""}
                              onChange={(e) => updateStepConfig(i, "fieldName", e.target.value)}
                              className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                              placeholder={t("fieldName")}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{t("fieldType")}</label>
                            <select
                              value={cfg.fieldType ?? "text"}
                              onChange={(e) => updateStepConfig(i, "fieldType", e.target.value)}
                              className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                            >
                              <option value="text">{t("fieldTypeText")}</option>
                              <option value="number">{t("fieldTypeNumber")}</option>
                              <option value="date">{t("fieldTypeDate")}</option>
                              <option value="select">{t("fieldTypeSelect")}</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {step.action === "send_email" && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">{t("emailTo")}</label>
                              <input
                                value={cfg.emailTo ?? ""}
                                onChange={(e) => updateStepConfig(i, "emailTo", e.target.value)}
                                className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                                placeholder={t("emailTo")}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">{t("emailSubject")}</label>
                              <input
                                value={cfg.emailSubject ?? ""}
                                onChange={(e) => updateStepConfig(i, "emailSubject", e.target.value)}
                                className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                                placeholder={t("emailSubject")}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{t("emailBody")}</label>
                            <textarea
                              value={cfg.emailBody ?? ""}
                              onChange={(e) => updateStepConfig(i, "emailBody", e.target.value)}
                              rows={2}
                              className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs resize-none"
                              placeholder={t("emailBody")}
                            />
                          </div>
                        </div>
                      )}

                      {step.action === "send_webhook" && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2 space-y-1">
                            <label className="text-xs text-muted-foreground">URL</label>
                            <input
                              value={cfg.webhookUrl ?? ""}
                              onChange={(e) => updateStepConfig(i, "webhookUrl", e.target.value)}
                              className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs font-mono"
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Method</label>
                            <select
                              value={cfg.webhookMethod ?? "POST"}
                              onChange={(e) => updateStepConfig(i, "webhookMethod", e.target.value)}
                              className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                            >
                              <option value="POST">POST</option>
                              <option value="GET">GET</option>
                              <option value="PUT">PUT</option>
                              <option value="PATCH">PATCH</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {step.action === "send_whatsapp" && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">שם תבנית (Template Name)</label>
                              <input
                                value={cfg.whatsappTemplateName ?? ""}
                                onChange={(e) => updateStepConfig(i, "whatsappTemplateName", e.target.value)}
                                className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs font-mono"
                                placeholder="welcome_lead"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">שפת תבנית</label>
                              <select
                                value={cfg.whatsappTemplateLanguage ?? "he"}
                                onChange={(e) => updateStepConfig(i, "whatsappTemplateLanguage", e.target.value)}
                                className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                              >
                                <option value="he">עברית (he)</option>
                                <option value="en_US">English (en_US)</option>
                              </select>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{"שדות לתוך התבנית ({{1}}, {{2}}...)"}</label>
                            <input
                              value={cfg.whatsappBodyParams ?? ""}
                              onChange={(e) => updateStepConfig(i, "whatsappBodyParams", e.target.value)}
                              className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs font-mono"
                              placeholder="customerName, company"
                              dir="ltr"
                            />
                            <p className="text-[10px] text-muted-foreground">שמות שדות מהליד, מופרדים בפסיק. לדוגמה: customerName, company</p>
                          </div>
                          <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 rounded-lg px-2 py-1.5">
                            נדרשת תבנית מאושרת ב-Meta Business. הגדר WHATSAPP_TOKEN + WHATSAPP_PHONE_NUMBER_ID בסביבת Vercel.
                          </p>
                        </div>
                      )}

                      {step.action === "score_lead_ai" && (
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">קריטריונים לניקוד (AI יקרא זאת)</label>
                            <textarea
                              value={cfg.aiScoringCriteria ?? ""}
                              onChange={(e) => updateStepConfig(i, "aiScoringCriteria", e.target.value)}
                              rows={3}
                              className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs resize-none"
                              placeholder="לדוגמה: לקוחות עסקים קטנים ובינוניים עם מחזור מעל 50K שח, שצריכים CRM ואוטומציות. ציון גבוה = כאב ברור + תקציב +"
                            />
                          </div>
                          <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg px-2 py-1.5">
                            <Zap className="h-3 w-3 text-purple-500 shrink-0" />
                            <p className="text-[10px] text-purple-700 dark:text-purple-300">
                              AI יקרא את פרטי הליד (שם, חברה, הערות, שווי עסקה) וידרג אותו 1-10. הניקוד יעודכן אוטומטית בשדה &quot;ציון AI&quot; של הליד.
                            </p>
                          </div>
                        </div>
                      )}

                      {step.action === "create_task" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{t("taskTitle")}</label>
                            <input
                              value={(cfg.taskTitle as string | undefined) ?? ""}
                              onChange={(e) => updateStepConfig(i, "taskTitle", e.target.value)}
                              className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                              placeholder={t("taskTitle")}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">{t("taskDescription")}</label>
                            <input
                              value={(cfg.taskDescription as string | undefined) ?? ""}
                              onChange={(e) => updateStepConfig(i, "taskDescription", e.target.value)}
                              className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                              placeholder={t("taskDescription")}
                            />
                          </div>
                        </div>
                      )}

                      {step.action === "notify" && (
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">{t("notifyMessage")}</label>
                          <input
                            value={cfg.message ?? ""}
                            onChange={(e) => updateStepConfig(i, "message", e.target.value)}
                            className="w-full rounded-lg border bg-background px-2 py-1.5 text-xs"
                            placeholder={t("notifyMessage")}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add Action Button / Action Picker */}
              <div className="flex justify-center pt-1">
                {showAddAction ? (
                  <div className="w-full rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 space-y-2">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 text-center mb-2">{t("selectAction")}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ACTIONS.map((act) => {
                        const AIcon = ACTION_ICONS[act];
                        const colorClass = ACTION_COLORS[act];
                        return (
                          <button
                            key={act}
                            onClick={() => addStep(act)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all hover:scale-[1.02] hover:shadow-sm ${colorClass}`}
                          >
                            <AIcon className="h-3.5 w-3.5" />
                            {ACTION_LABELS_HE[act] ?? t(ACTION_KEYS[act])}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex justify-center pt-1">
                      <button
                        onClick={() => setShowAddAction(false)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddAction(true)}
                    className="border-dashed border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Plus className="h-3.5 w-3.5 me-1" />
                    {t("addStep")}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="bg-blue-600 hover:bg-blue-700">
            {t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
