"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Zap, Webhook, KeyRound, Bot, Plus, Trash2, Power,
  Globe, Send, Bell, Pencil, Shield, Sparkles,
  ArrowRight, ArrowDown, ToggleLeft, ToggleRight,
  Clock, MousePointerClick, RefreshCw, Mail, ListPlus,
  FilePlus, CheckSquare, MessageCircle,
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
};

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

  const tabs = [
    { id: "automations" as Tab, label: t("automationsTab"), desc: t("automationBuilderDesc"), icon: Bot, count: automations.length },
    { id: "webhooks" as Tab, label: t("webhooks"), desc: t("webhooksDesc"), icon: Globe, count: webhooks.length },
    { id: "apiKeys" as Tab, label: t("apiKeys"), desc: t("apiKeysDesc"), icon: KeyRound, count: apiKeys.length },
  ];

  const activeWebhookCount = webhooks.filter((w) => w.active).length;
  const activeAutoCount = automations.filter((a) => a.active).length;

  const stats = [
    { label: t("totalAutomations"), value: automations.length, iconBg: "bg-sky-500/15", iconColor: "text-sky-600", valueColor: "text-sky-700 dark:text-sky-300", icon: Bot },
    { label: t("activeAutomations"), value: activeAutoCount, iconBg: "bg-emerald-500/15", iconColor: "text-emerald-600", valueColor: "text-emerald-700 dark:text-emerald-300", icon: Power },
    { label: t("totalWebhooks"), value: webhooks.length, iconBg: "bg-violet-500/15", iconColor: "text-violet-600", valueColor: "text-violet-700 dark:text-violet-300", icon: Globe },
    { label: t("totalApiKeys"), value: apiKeys.length, iconBg: "bg-amber-500/15", iconColor: "text-amber-600", valueColor: "text-amber-700 dark:text-amber-300", icon: KeyRound },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -start-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
              <p className="text-white/70 text-sm mt-0.5">{t("subtitle")}</p>
            </div>
          </div>
          <Button
            onClick={() => { setEditingAutomation(null); setAutomationDialog(true); }}
            className="bg-white text-blue-700 hover:bg-white/90 font-semibold shadow-lg"
          >
            <Plus className="h-4 w-4 me-1" />
            {t("addAutomation")}
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <div className={`h-8 w-8 rounded-xl ${stat.iconBg} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </div>
              <p className={`text-2xl font-extrabold ${stat.valueColor}`}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-card border text-muted-foreground hover:bg-blue-50 dark:hover:bg-blue-950/30"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-white/20" : "bg-muted"
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Automations Tab */}
        {activeTab === "automations" && (
          <div>
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-sky-600" />
                </div>
                <h2 className="text-lg font-bold">{t("automationBuilder")}</h2>
              </div>
              <Button onClick={() => { setEditingAutomation(null); setAutomationDialog(true); }} size="sm">
                <Plus className="h-4 w-4 me-1" />
                {t("addAutomation")}
              </Button>
            </div>

            {automations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-900/30 dark:to-blue-900/30 flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-sky-500" />
                </div>
                <p className="font-semibold text-lg">{t("noAutomations")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("noAutomationsHint")}</p>
              </div>
            ) : (
              <div className="divide-y">
                {automations.map((auto) => {
                  const TIcon = TRIGGER_ICONS[auto.trigger] ?? Zap;
                  return (
                    <div key={auto.id} className="p-4 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button onClick={() => toggleAutomation(auto.id)} className="shrink-0">
                            {auto.active ? (
                              <ToggleRight className="h-6 w-6 text-emerald-500" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{auto.name}</p>
                            {auto.description && (
                              <p className="text-xs text-muted-foreground truncate">{auto.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => { setEditingAutomation(auto); setAutomationDialog(true); }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteAutomation(auto.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {/* Visual flow */}
                      <div className="mt-3 ms-9 flex items-center gap-1.5 flex-wrap">
                        {/* Trigger badge */}
                        <div className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg px-2.5 py-1 text-xs font-medium">
                          <TIcon className="h-3 w-3" />
                          {t(TRIGGER_LABELS[auto.trigger])}
                          {auto.trigger === "field_changed" && auto.triggerConfig?.field && (
                            <span className="text-blue-500 font-mono">({auto.triggerConfig.field})</span>
                          )}
                          {auto.trigger === "scheduled" && auto.triggerConfig?.scheduleTime && (
                            <span className="text-blue-500 font-mono">({auto.triggerConfig.scheduleTime})</span>
                          )}
                          {auto.trigger === "button_click" && auto.triggerConfig?.buttonLabel && (
                            <span className="text-blue-500">({auto.triggerConfig.buttonLabel})</span>
                          )}
                        </div>

                        {/* Flow arrows + action badges */}
                        {auto.steps.map((step) => {
                          const AIcon = ACTION_ICONS[step.action] ?? Zap;
                          const colorClass = ACTION_COLORS[step.action] ?? "bg-slate-100 text-slate-700 border-slate-200";
                          return (
                            <span key={step.id} className="flex items-center gap-1.5">
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <span className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium border ${colorClass}`}>
                                <AIcon className="h-3 w-3" />
                                {t(ACTION_LABELS[step.action])}
                              </span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === "webhooks" && (
          <div>
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-violet-600" />
                </div>
                <h2 className="text-lg font-bold">{t("webhooks")}</h2>
              </div>
              <Button onClick={() => { setEditingWebhook(null); setWebhookDialog(true); }} size="sm">
                <Plus className="h-4 w-4 me-1" />
                {t("addWebhook")}
              </Button>
            </div>

            {webhooks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-violet-500" />
                </div>
                <p className="font-semibold text-lg">{t("noWebhooks")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("noWebhooksHint")}</p>
              </div>
            ) : (
              <div className="divide-y">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="flex items-center justify-between p-4 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
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
                          <p className="font-semibold truncate">{wh.name}</p>
                          <Badge variant="outline" className="text-xs font-mono shrink-0">{wh.method}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate font-mono">{wh.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={wh.active ? "default" : "secondary"} className="text-xs">
                        {wh.active ? t("webhookActive") : t("webhookInactive")}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setEditingWebhook(wh); setWebhookDialog(true); }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => deleteWebhook(wh.id)}
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

        {/* API Keys Tab */}
        {activeTab === "apiKeys" && (
          <div>
            <div className="flex items-center justify-between p-5 border-b">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <KeyRound className="h-4 w-4 text-amber-600" />
                </div>
                <h2 className="text-lg font-bold">{t("apiKeys")}</h2>
              </div>
              <Button onClick={() => setApiKeyDialog(true)} size="sm">
                <Plus className="h-4 w-4 me-1" />
                {t("addApiKey")}
              </Button>
            </div>

            {apiKeys.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-4">
                  <KeyRound className="h-8 w-8 text-amber-500" />
                </div>
                <p className="font-semibold text-lg">{t("noApiKeys")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("noApiKeysHint")}</p>
              </div>
            ) : (
              <div className="divide-y">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{key.name}</p>
                          <Badge variant="outline" className="text-xs">{key.service}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">{key.keyPreview}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                        <Shield className="h-3 w-3 me-1" />
                        {t("encrypted")}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
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
      </div>

      {/* Dialogs */}
      <WebhookDialog
        open={webhookDialog}
        onOpenChange={setWebhookDialog}
        webhook={editingWebhook}
        onSave={(data) => {
          if (editingWebhook) {
            updateWebhook(editingWebhook.id, data);
          } else {
            addWebhook(data as any);
          }
          setWebhookDialog(false);
        }}
      />
      <ApiKeyDialog
        open={apiKeyDialog}
        onOpenChange={setApiKeyDialog}
        onSave={(name, service, key) => {
          addApiKey(name, service, key);
          setApiKeyDialog(false);
        }}
      />
      <AutomationDialog
        open={automationDialog}
        onOpenChange={setAutomationDialog}
        automation={editingAutomation}
        onSave={(data) => {
          if (editingAutomation) {
            updateAutomation(editingAutomation.id, data);
          } else {
            addAutomation(data as any);
          }
          setAutomationDialog(false);
        }}
      />
    </div>
  );
}
