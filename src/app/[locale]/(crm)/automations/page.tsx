"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Zap, Webhook, KeyRound, Bot, Plus, Trash2, Power,
  Globe, Bell, Pencil, Shield, Sparkles,
  ArrowRight, ToggleLeft, ToggleRight,
  Clock, MousePointerClick, RefreshCw, Mail, ListPlus,
  FilePlus, CheckSquare, MessageCircle, ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWebhooks, useApiKeys, useAutomations } from "@/hooks/use-automations";
import { WebhookDialog } from "@/components/automations/webhook-dialog";
import { ApiKeyDialog } from "@/components/automations/api-key-dialog";
import { AutomationDialog } from "@/components/automations/automation-dialog";
import type { Webhook as WebhookType, Automation, AutomationTrigger, AutomationAction } from "@/lib/types";

type Tab = "automations" | "webhooks" | "apiKeys";

const TRIGGER_LABELS: Record<AutomationTrigger, string> = {
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
};

const ACTION_ICONS: Record<AutomationAction, typeof Zap> = {
  update_field: Pencil,
  create_instance: ListPlus,
  create_field: FilePlus,
  send_email: Mail,
  send_webhook: Webhook,
  create_task: CheckSquare,
  notify: Bell,
  sync_accounting: RefreshCw,
  create_invoice: FilePlus,
  send_whatsapp: MessageCircle,
  score_lead_ai: Sparkles,
};

const ACTION_LABELS: Record<AutomationAction, string> = {
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

const CATEGORY_CONFIG: Record<string, { gradient: string; bg: string; text: string; border: string; dot: string }> = {
  "לידים":   { gradient: "from-blue-500 to-indigo-500",   bg: "bg-blue-50 dark:bg-blue-950/30",   text: "text-blue-700 dark:text-blue-300",   border: "border-blue-400", dot: "bg-blue-400" },
  "פגישות":  { gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-400", dot: "bg-emerald-400" },
  "מכירות":  { gradient: "from-violet-500 to-purple-500", bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-700 dark:text-violet-300", border: "border-violet-400", dot: "bg-violet-400" },
  "כספים":   { gradient: "from-amber-500 to-orange-500",  bg: "bg-amber-50 dark:bg-amber-950/30",   text: "text-amber-700 dark:text-amber-300",   border: "border-amber-400", dot: "bg-amber-400" },
  "תוכן":    { gradient: "from-pink-500 to-rose-500",     bg: "bg-pink-50 dark:bg-pink-950/30",     text: "text-pink-700 dark:text-pink-300",     border: "border-pink-400", dot: "bg-pink-400" },
  "כללי":    { gradient: "from-slate-500 to-gray-500",    bg: "bg-slate-50 dark:bg-slate-900/30",   text: "text-slate-700 dark:text-slate-300",   border: "border-slate-400", dot: "bg-slate-400" },
};

function getCategoryConfig(cat?: string) {
  return CATEGORY_CONFIG[cat ?? "כללי"] ?? CATEGORY_CONFIG["כללי"];
}

export default function AutomationsPage() {
  const t = useTranslations("automations");
  const [activeTab, setActiveTab] = useState<Tab>("automations");
  const [webhookDialog, setWebhookDialog] = useState(false);
  const [apiKeyDialog, setApiKeyDialog] = useState(false);
  const [automationDialog, setAutomationDialog] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookType | null>(null);
  const [editingAutomation, setEditingAutomation] = useState<Automation | null>(null);

  const { webhooks, addWebhook, updateWebhook, deleteWebhook, toggleWebhook } = useWebhooks();
  const { apiKeys, addApiKey, deleteApiKey } = useApiKeys();
  const { automations, addAutomation, updateAutomation, deleteAutomation, toggleAutomation } = useAutomations();

  const activeAutoCount = automations.filter((a) => a.active).length;

  // Group automations by category
  const grouped = automations.reduce<Record<string, Automation[]>>((acc, auto) => {
    const cat = auto.category ?? "כללי";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(auto);
    return acc;
  }, {});

  const categoryOrder = ["לידים", "פגישות", "מכירות", "כספים", "תוכן", "כללי"];
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <div className="space-y-5 pb-10">
      {/* ── Hero ── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white shadow-xl">
        {/* Decorative blobs */}
        <div className="absolute -top-12 -end-12 h-48 w-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -start-10 h-40 w-40 rounded-full bg-sky-400/20 blur-2xl pointer-events-none" />
        <div className="absolute top-4 start-1/3 h-24 w-24 rounded-full bg-violet-400/20 blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-1 ring-white/30">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
              <p className="text-white/70 text-sm mt-0.5">{t("subtitle")}</p>
            </div>
          </div>
          <Button
            onClick={() => { setEditingAutomation(null); setAutomationDialog(true); }}
            className="bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-lg rounded-xl"
          >
            <Plus className="h-4 w-4 me-1" />
            {t("addAutomation")}
          </Button>
        </div>

        {/* ── Pill stats bar ── */}
        <div className="relative mt-5 flex flex-wrap gap-2">
          {[
            { icon: Bot, label: t("totalAutomations"), value: automations.length },
            { icon: Power, label: t("activeAutomations"), value: activeAutoCount },
            { icon: Globe, label: t("totalWebhooks"), value: webhooks.length },
            { icon: KeyRound, label: t("totalApiKeys"), value: apiKeys.length },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium ring-1 ring-white/20">
                <Icon className="h-4 w-4 text-white/80" />
                <span className="text-white/80">{s.label}</span>
                <span className="text-white font-bold">{s.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 flex-wrap bg-muted/50 rounded-2xl p-1.5 w-fit">
        {([
          { id: "automations" as Tab, label: t("automationsTab"), icon: Bot, count: automations.length },
          { id: "webhooks" as Tab, label: t("webhooks"), icon: Globe, count: webhooks.length },
          { id: "apiKeys" as Tab, label: t("apiKeys"), icon: KeyRound, count: apiKeys.length },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                isActive ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-muted"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Automations Tab ── */}
      {activeTab === "automations" && (
        <div className="space-y-5">
          {automations.length === 0 ? (
            <div className="rounded-3xl border bg-card p-16 flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-sky-500" />
              </div>
              <p className="font-semibold text-lg">{t("noAutomations")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("noAutomationsHint")}</p>
            </div>
          ) : (
            sortedCategories.map((category) => {
              const cfg = getCategoryConfig(category);
              const items = grouped[category];
              return (
                <div key={category}>
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-2 px-1">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {category}
                    </span>
                    <div className={`flex-1 h-px bg-gradient-to-r ${cfg.gradient} opacity-20`} />
                    <span className="text-xs text-muted-foreground">{items.length}</span>
                  </div>

                  {/* Automation cards */}
                  <div className="space-y-2">
                    {items.map((auto) => {
                      const TIcon = TRIGGER_ICONS[auto.trigger] ?? Zap;
                      return (
                        <div
                          key={auto.id}
                          className={`group relative flex items-start gap-3 rounded-2xl border bg-card p-4 transition-all hover:shadow-md border-s-4 ${cfg.border}`}
                        >
                          {/* Toggle */}
                          <button
                            onClick={() => toggleAutomation(auto.id)}
                            className="mt-0.5 shrink-0 transition-transform hover:scale-110"
                          >
                            {auto.active ? (
                              <ToggleRight className="h-6 w-6 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                            )}
                          </button>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-sm">{auto.name}</p>
                              {auto.isPreset && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                                  ⚡ Make
                                </span>
                              )}
                              {!auto.active && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                                  כבוי
                                </span>
                              )}
                            </div>

                            {/* Flow chips */}
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              <div className={`flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
                                <TIcon className="h-3 w-3" />
                                {t(TRIGGER_LABELS[auto.trigger])}
                              </div>
                              {auto.steps.map((step) => {
                                const AIcon = ACTION_ICONS[step.action] ?? Zap;
                                return (
                                  <span key={step.id} className="flex items-center gap-1.5">
                                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                    <span className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                      <AIcon className="h-3 w-3" />
                                      {t(ACTION_LABELS[step.action])}
                                    </span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            {auto.makeScenarioId && (
                              <a
                                href={`https://eu2.make.com/`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                title="פתח ב-Make.com"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                            {!auto.isPreset && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => { setEditingAutomation(auto); setAutomationDialog(true); }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {!auto.isPreset && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteAutomation(auto.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Webhooks Tab ── */}
      {activeTab === "webhooks" && (
        <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Globe className="h-4 w-4 text-violet-600" />
              </div>
              <h2 className="text-lg font-bold">{t("webhooks")}</h2>
            </div>
            <Button onClick={() => { setEditingWebhook(null); setWebhookDialog(true); }} size="sm" className="rounded-xl">
              <Plus className="h-4 w-4 me-1" />
              {t("addWebhook")}
            </Button>
          </div>

          {webhooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center mb-3">
                <Globe className="h-7 w-7 text-violet-400" />
              </div>
              <p className="font-semibold">{t("noWebhooks")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("noWebhooksHint")}</p>
            </div>
          ) : (
            <div className="divide-y p-4 space-y-2">
              {webhooks.map((wh) => (
                <div key={wh.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/40 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button onClick={() => toggleWebhook(wh.id)} className="shrink-0">
                      {wh.active ? (
                        <ToggleRight className="h-6 w-6 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">{wh.name}</p>
                        <Badge variant="outline" className="text-xs font-mono shrink-0 rounded-full">{wh.method}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate font-mono">{wh.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingWebhook(wh); setWebhookDialog(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteWebhook(wh.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── API Keys Tab ── */}
      {activeTab === "apiKeys" && (
        <div className="rounded-3xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <KeyRound className="h-4 w-4 text-amber-600" />
              </div>
              <h2 className="text-lg font-bold">{t("apiKeys")}</h2>
            </div>
            <Button onClick={() => setApiKeyDialog(true)} size="sm" className="rounded-xl">
              <Plus className="h-4 w-4 me-1" />
              {t("addApiKey")}
            </Button>
          </div>

          {apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-3">
                <KeyRound className="h-7 w-7 text-amber-400" />
              </div>
              <p className="font-semibold">{t("noApiKeys")}</p>
              <p className="text-sm text-muted-foreground mt-1">{t("noApiKeysHint")}</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/40 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{key.name}</p>
                        <Badge variant="outline" className="text-xs rounded-full">{key.service}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{key.keyPreview}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 font-medium">
                      {t("encrypted")}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteApiKey(key.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Dialogs ── */}
      <WebhookDialog
        open={webhookDialog}
        onOpenChange={setWebhookDialog}
        webhook={editingWebhook}
        onSave={(data) => {
          if (editingWebhook) updateWebhook(editingWebhook.id, data);
          else addWebhook(data as Parameters<typeof addWebhook>[0]);
          setWebhookDialog(false);
        }}
      />
      <ApiKeyDialog
        open={apiKeyDialog}
        onOpenChange={setApiKeyDialog}
        onSave={(name, service, key) => { addApiKey(name, service, key); setApiKeyDialog(false); }}
      />
      <AutomationDialog
        open={automationDialog}
        onOpenChange={setAutomationDialog}
        automation={editingAutomation}
        onSave={(data) => {
          if (editingAutomation) updateAutomation(editingAutomation.id, data as Partial<Automation>);
          else addAutomation(data as Parameters<typeof addAutomation>[0]);
          setAutomationDialog(false);
        }}
      />
    </div>
  );
}
