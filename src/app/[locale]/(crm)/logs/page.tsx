"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useActivityLog } from "@/hooks/use-activity-log";
import {
  ScrollText, Search, Filter, ChevronDown, ChevronUp,
  Trash2, Clock, AlertTriangle, Activity,
  Plus, Pencil, Trash, ArrowRightLeft, RefreshCw, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { LogAction, LogEntityType } from "@/lib/types";

const ACTION_ICONS: Record<LogAction, typeof Plus> = {
  create: Plus,
  update: Pencil,
  delete: Trash,
  convert: ArrowRightLeft,
  status_change: RefreshCw,
  send: Send,
  import: Plus,
  export: Send,
};

const ACTION_COLORS: Record<LogAction, string> = {
  create: "bg-emerald-100 text-emerald-700 border-emerald-200",
  update: "bg-blue-100 text-blue-700 border-blue-200",
  delete: "bg-red-100 text-red-700 border-red-200",
  convert: "bg-violet-100 text-violet-700 border-violet-200",
  status_change: "bg-amber-100 text-amber-700 border-amber-200",
  send: "bg-sky-100 text-sky-700 border-sky-200",
  import: "bg-indigo-100 text-indigo-700 border-indigo-200",
  export: "bg-teal-100 text-teal-700 border-teal-200",
};

const ENTITY_COLORS: Record<LogEntityType, string> = {
  lead: "bg-orange-50 text-orange-600",
  customer: "bg-blue-50 text-blue-600",
  quote: "bg-purple-50 text-purple-600",
  task: "bg-green-50 text-green-600",
  form: "bg-pink-50 text-pink-600",
  automation: "bg-yellow-50 text-yellow-600",
  webhook: "bg-cyan-50 text-cyan-600",
  product: "bg-lime-50 text-lime-600",
  calendar_event: "bg-indigo-50 text-indigo-600",
  interaction: "bg-rose-50 text-rose-600",
  system: "bg-gray-50 text-gray-600",
};

export default function LogsPage() {
  const t = useTranslations("logs");
  const { logs, clearLogs } = useActivityLog();

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState<LogAction | "all">("all");
  const [entityFilter, setEntityFilter] = useState<LogEntityType | "all">("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [confirmClear, setConfirmClear] = useState(false);

  const actionLabel = (a: LogAction) => {
    const map: Record<LogAction, string> = {
      create: t("actionCreate"),
      update: t("actionUpdate"),
      delete: t("actionDelete"),
      convert: t("actionConvert"),
      status_change: t("actionStatusChange"),
      send: t("actionSend"),
      import: "Import",
      export: t("exportLogs"),
    };
    return map[a] || a;
  };

  const entityLabel = (e: LogEntityType) => {
    const map: Record<LogEntityType, string> = {
      lead: t("entityLead"),
      customer: t("entityCustomer"),
      quote: t("entityQuote"),
      task: t("entityTask"),
      form: t("entityForm"),
      automation: t("entityAutomation"),
      webhook: t("entityWebhook"),
      product: t("entityProduct"),
      calendar_event: t("entityCalendarEvent"),
      interaction: t("entityInteraction"),
      system: t("entitySystem"),
    };
    return map[e] || e;
  };

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter !== "all" && log.action !== actionFilter) return false;
      if (entityFilter !== "all" && log.entityType !== entityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          log.entityName.toLowerCase().includes(q) ||
          (log.details?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [logs, actionFilter, entityFilter, search]);

  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return logs.filter((l) => l.timestamp.startsWith(today)).length;
  }, [logs]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = [
    {
      label: t("totalLogs"),
      value: logs.length,
      icon: Activity,
      color: "violet",
    },
    {
      label: t("todayLogs"),
      value: todayCount,
      icon: Clock,
      color: "sky",
    },
    {
      label: t("errorLogs"),
      value: logs.filter((l) => l.action === "delete").length,
      icon: AlertTriangle,
      color: "amber",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="absolute end-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 start-0 h-32 w-32 -translate-x-8 translate-y-8 rounded-full bg-sky-400/20 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <ScrollText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">{t("title")}</h1>
              <p className="text-sm text-white/70">{t("subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {confirmClear ? (
              <>
                <span className="text-sm text-white/80 me-2">{t("clearConfirm")}</span>
                <Button
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => { clearLogs(); setConfirmClear(false); }}
                >
                  <Trash2 className="h-4 w-4 me-1" />
                  {t("clearLogs")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/15 border-white/20 text-white backdrop-blur-sm hover:bg-white/25"
                  onClick={() => setConfirmClear(false)}
                >
                  {/* Cancel */}
                  ✕
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="bg-white/15 border-white/20 text-white backdrop-blur-sm hover:bg-white/25"
                onClick={() => setConfirmClear(true)}
                disabled={logs.length === 0}
              >
                <Trash2 className="h-4 w-4 me-1" />
                {t("clearLogs")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`rounded-2xl border bg-gradient-to-br from-${s.color}-50 to-${s.color}-100/50 p-5 shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-extrabold text-${s.color}-700 dark:text-${s.color}-300`}>
                    {s.value}
                  </p>
                </div>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-${s.color}-500/15`}>
                  <Icon className={`h-4 w-4 text-${s.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter Bar ── */}
      <div className="rounded-2xl border bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15">
            <Filter className="h-4 w-4 text-emerald-600" />
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("noLogsHint")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9 h-9"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value as LogAction | "all")}
            className="h-9 rounded-lg border bg-white dark:bg-gray-800 px-3 text-sm"
          >
            <option value="all">{t("allActions")}</option>
            <option value="create">{t("actionCreate")}</option>
            <option value="update">{t("actionUpdate")}</option>
            <option value="delete">{t("actionDelete")}</option>
            <option value="convert">{t("actionConvert")}</option>
            <option value="status_change">{t("actionStatusChange")}</option>
            <option value="send">{t("actionSend")}</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value as LogEntityType | "all")}
            className="h-9 rounded-lg border bg-white dark:bg-gray-800 px-3 text-sm"
          >
            <option value="all">{t("allEntities")}</option>
            <option value="lead">{t("entityLead")}</option>
            <option value="customer">{t("entityCustomer")}</option>
            <option value="quote">{t("entityQuote")}</option>
            <option value="task">{t("entityTask")}</option>
            <option value="form">{t("entityForm")}</option>
            <option value="automation">{t("entityAutomation")}</option>
            <option value="webhook">{t("entityWebhook")}</option>
            <option value="product">{t("entityProduct")}</option>
            <option value="calendar_event">{t("entityCalendarEvent")}</option>
          </select>
        </div>
      </div>

      {/* ── Log Entries ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border bg-card p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <ScrollText className="h-8 w-8 text-slate-400" />
          </div>
          <p className="text-lg font-semibold text-muted-foreground">{t("noLogs")}</p>
          <p className="text-sm text-muted-foreground mt-1">{t("noLogsHint")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((log) => {
            const ActionIcon = ACTION_ICONS[log.action] ?? Activity;
            const isExpanded = expandedIds.has(log.id);
            const hasChanges = log.changes && Object.keys(log.changes).length > 0;

            return (
              <div
                key={log.id}
                className="rounded-xl border bg-card shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Action icon */}
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ACTION_COLORS[log.action]?.split(" ")[0]} border ${ACTION_COLORS[log.action]?.split(" ")[2]}`}>
                    <ActionIcon className={`h-4 w-4 ${ACTION_COLORS[log.action]?.split(" ")[1]}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className={ACTION_COLORS[log.action]}>
                        {actionLabel(log.action)}
                      </Badge>
                      <Badge variant="outline" className={ENTITY_COLORS[log.entityType]}>
                        {entityLabel(log.entityType)}
                      </Badge>
                      <span className="font-semibold text-sm truncate">
                        {log.entityName}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {log.details}
                      </p>
                    )}
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(log.timestamp)}
                    </span>
                    {hasChanges && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => toggleExpand(log.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded changes */}
                {isExpanded && hasChanges && (
                  <div className="border-t px-4 py-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-xl">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{t("showChanges")}:</p>
                    <div className="space-y-1">
                      {Object.entries(log.changes!).map(([field, { from, to }]) => (
                        <div key={field} className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-slate-600 dark:text-slate-400 min-w-[80px]">
                            {field}
                          </span>
                          <span className="text-red-500 line-through">
                            {from ?? "—"}
                          </span>
                          <span className="text-muted-foreground">→</span>
                          <span className="text-emerald-600 font-medium">
                            {to ?? "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
