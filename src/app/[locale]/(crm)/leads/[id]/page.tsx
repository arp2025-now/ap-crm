"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  ArrowRight, Mail, Phone, Building2, Flame, Thermometer, Snowflake,
  CheckSquare, Plus, TrendingUp, User, UserCheck, FileText, ClipboardList, Zap, StickyNote,
  CalendarDays, Video,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InteractionLog } from "@/components/shared/interaction-log";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { useLeads } from "@/hooks/use-leads";
import { useCustomers } from "@/hooks/use-customers";
import { useQuotes } from "@/hooks/use-quotes";
import { useTasks } from "@/hooks/use-tasks";
import { useForms } from "@/hooks/use-forms";
import { useFieldDefinitions } from "@/hooks/use-field-definitions";
import { useAutomations } from "@/hooks/use-automations";
import { useMeetings } from "@/hooks/use-meetings";
import { useRecordings } from "@/hooks/use-recordings";
import { getInitials, formatCurrency, formatDate } from "@/lib/utils";
import type { HeatLevel, Customer } from "@/lib/types";

const HEAT_ICON: Record<HeatLevel, typeof Flame> = { hot: Flame, warm: Thermometer, cold: Snowflake };
const HEAT_COLORS: Record<HeatLevel, string> = {
  hot: "from-rose-100 to-red-100 text-rose-700 border-rose-200",
  warm: "from-amber-100 to-orange-100 text-amber-700 border-amber-200",
  cold: "from-sky-100 to-blue-100 text-sky-700 border-sky-200",
};

export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("leads");
  const locale = useLocale();
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";

  const { leads, updateLead } = useLeads();
  const { customers, addCustomer, nextSerial: nextCustomerSerial } = useCustomers();
  const { quotes } = useQuotes();
  const { getTasksForLead, addTask, updateTask, deleteTask } = useTasks();
  const { forms } = useForms();
  const { fields } = useFieldDefinitions();
  const { automations } = useAutomations();
  const { meetings } = useMeetings(id);
  const { recordings } = useRecordings(id);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const router = useRouter();

  // Status label lookup from field definitions
  const statusField = fields.find((f) => f.id === "status");
  const getStatusLabel = (status: string) => {
    const opt = statusField?.options?.find((o) => o.id === status);
    return opt?.label ?? status;
  };
  const getStatusColor = (status: string) => {
    const opt = statusField?.options?.find((o) => o.id === status);
    return opt?.color;
  };

  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <p>ליד לא נמצא (ID: {id})</p>
      </div>
    );
  }

  const HeatIcon = HEAT_ICON[lead.heatLevel];
  const leadTasks = getTasksForLead(id);
  const isConverted = lead.status === "converted";

  // Find quotes linked to this lead's customer
  const linkedQuotes = quotes.filter((q) => q.customerId === lead.customerId);
  const signedQuoteTotal = linkedQuotes
    .filter((q) => q.status === "signed")
    .reduce((sum, q) => sum + q.total, 0);
  const latestQuoteTotal = linkedQuotes.length > 0
    ? linkedQuotes.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0].total
    : 0;

  const handleConvert = () => {
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      serialNumber: nextCustomerSerial(),
      name: lead.customerName,
      phone: lead.phone ?? "",
      email: lead.customerEmail ?? "",
      company: lead.company ?? "",
      industry: "",
      assignedAgentId: lead.assignedAgentId ?? "",
      tags: [],
      sentimentScore: 0,
      lifetimeValue: signedQuoteTotal || lead.pipelineValue,
      healthGrade: "—",
      lifecycleStage: "active",
      createdAt: now,
      updatedAt: now,
      createdBy: "אני",
      updatedBy: "אני",
      convertedFromLeadId: lead.id,
      convertedAt: now,
    };
    addCustomer(newCustomer);
    updateLead(lead.id, { status: "converted" });
    router.push(`/${locale}/customers/${newCustomer.id}`);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ── Hero Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-xl">
        <div className="absolute -top-10 -end-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -start-8 h-32 w-32 rounded-full bg-sky-400/20 blur-2xl" />

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6">
          <Avatar className="h-20 w-20 rounded-2xl ring-4 ring-white/20">
            <AvatarFallback className="bg-white/20 backdrop-blur-sm text-white text-2xl font-bold rounded-2xl">
              {getInitials(lead.customerName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-start space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">{lead.customerName}</h2>
            <p className="text-white/70">
              {lead.company} • {getStatusLabel(lead.status)}
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
              <Badge className={`bg-gradient-to-r ${HEAT_COLORS[lead.heatLevel]} border text-xs font-bold`}>
                <HeatIcon className="h-3 w-3 me-1" />
                {t(`heat${lead.heatLevel.charAt(0).toUpperCase() + lead.heatLevel.slice(1)}` as any)}
              </Badge>
              <Badge
                className="text-white border-white/20 text-xs font-bold"
                style={{ backgroundColor: getStatusColor(lead.status) ?? "rgba(255,255,255,0.15)" }}
              >
                {getStatusLabel(lead.status)}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {!isConverted && (
              <Button
                onClick={handleConvert}
                className="rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg gap-1.5 font-semibold"
              >
                <UserCheck className="h-5 w-5" />
                {t("convertToCustomer")}
              </Button>
            )}
            {isConverted && (
              <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-400/30 text-sm px-3 py-1.5">
                <UserCheck className="h-4 w-4 me-1" />
                {t("converted")}
              </Badge>
            )}
            <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 bg-white/15 border-white/20 text-white hover:bg-white/25">
              <Mail className="h-5 w-5" />
            </Button>
            <Button size="icon" className="rounded-xl h-12 w-12 bg-white text-blue-700 hover:bg-white/90 shadow-lg">
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Info Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-sky-500/15 flex items-center justify-center">
              <User className="h-4 w-4 text-sky-600" />
            </div>
            <h3 className="font-bold">{t("contact")}</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">{t("email")}:</span> {lead.customerEmail}</p>
            <p><span className="text-muted-foreground">{t("phone")}:</span> {lead.phone}</p>
            <p><span className="text-muted-foreground">{t("company")}:</span> {lead.company || "—"}</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <h3 className="font-bold">{t("value")}</h3>
          </div>
          <p className="text-2xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            {formatCurrency(lead.pipelineValue, fmtLocale)}
          </p>
          {signedQuoteTotal > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <FileText className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-sm font-semibold text-emerald-600">{t("dealValue")}: {formatCurrency(signedQuoteTotal, fmtLocale)}</span>
            </div>
          )}
          {linkedQuotes.length > 0 && signedQuoteTotal === 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <FileText className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs text-muted-foreground">{linkedQuotes.length} {locale === "he" ? "הצעות מחיר" : "quotes"}</span>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">{t("lastContact")}: {lead.lastContactAt ? formatDate(lead.lastContactAt, fmtLocale) : "—"}</p>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-violet-600" />
            </div>
            <h3 className="font-bold">מידע מערכת</h3>
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">מספר סידורי:</span> #{lead.serialNumber}</p>
            <p><span className="text-muted-foreground">נוצר:</span> {formatDate(lead.createdAt, fmtLocale)}</p>
          </div>
        </div>
      </div>

      {/* ── Notes ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
            <StickyNote className="h-4 w-4 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold">{t("notes")}</h3>
        </div>
        <textarea
          value={lead.notes || ""}
          onChange={(e) => updateLead(lead.id, { notes: e.target.value })}
          placeholder={t("notesPlaceholder")}
          rows={3}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      {/* ── Tasks ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <CheckSquare className="h-4 w-4 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold">משימות</h3>
          </div>
          <Button size="sm" variant="outline" onClick={() => setTaskDialogOpen(true)}>
            <Plus className="h-4 w-4 me-1" />
            הוסף משימה
          </Button>
        </div>
        {leadTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">אין משימות לליד זה</p>
        ) : (
          <div className="space-y-2">
            {leadTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const next = { todo: "in_progress" as const, in_progress: "done" as const, done: "todo" as const };
                      updateTask(task.id, { status: next[task.status] });
                    }}
                    className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                      task.status === "done" ? "bg-emerald-500 border-emerald-500 text-white" :
                      task.status === "in_progress" ? "border-blue-500" : "border-muted-foreground/30"
                    }`}
                  >
                    {task.status === "done" && <CheckSquare className="h-3 w-3" />}
                  </button>
                  <span className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteTask(task.id)}>
                  <span className="text-xs">✕</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Linked Forms ── */}
      {(() => {
        const linkedForms = forms.filter((f) => f.linkedLeadId === id);
        if (linkedForms.length === 0) return null;
        return (
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-teal-500/15 flex items-center justify-center">
                <ClipboardList className="h-4 w-4 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold">טפסים משויכים</h3>
            </div>
            <div className="space-y-2">
              {linkedForms.map((form) => (
                <Link
                  key={form.id}
                  href={`/${locale}/forms`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList className="h-4 w-4 text-teal-500" />
                    <span className="text-sm font-medium">{form.title}</span>
                    <Badge className={`text-xs ${
                      form.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                      form.status === "closed" ? "bg-red-100 text-red-700 border-red-200" :
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {form.status === "active" ? "פעיל" : form.status === "closed" ? "סגור" : "טיוטה"}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{form.responseCount} תגובות</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Linked Automations ── */}
      {(() => {
        const LEAD_TRIGGERS = ["lead_created", "lead_updated", "lead_converted", "deal_won", "deal_lost"];
        const linkedAutomations = automations.filter((a) =>
          LEAD_TRIGGERS.includes(a.trigger) ||
          (a.trigger === "field_changed" && a.triggerConfig?.entity === "lead")
        );
        if (linkedAutomations.length === 0) return null;
        return (
          <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <Zap className="h-4 w-4 text-violet-600" />
              </div>
              <h3 className="text-lg font-bold">{t("linkedAutomations")}</h3>
            </div>
            <div className="space-y-2">
              {linkedAutomations.map((auto) => (
                <Link
                  key={auto.id}
                  href={`/${locale}/automations`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Zap className={`h-4 w-4 ${auto.active ? "text-violet-500" : "text-muted-foreground"}`} />
                    <span className="text-sm font-medium">{auto.name}</span>
                    <Badge className={`text-xs ${
                      auto.active
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {auto.active ? t("automationActive") : t("automationInactive")}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {auto.steps.length} {t("automationSteps")}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ── Meetings & Recordings ── */}
      {(meetings.length > 0 || recordings.length > 0) && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <CalendarDays className="h-4 w-4 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold">פגישות והקלטות</h3>
          </div>
          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-sm">{m.type}</span>
                    <p className="text-xs text-gray-500 mt-1">{new Date(m.scheduledAt).toLocaleDateString('he-IL')}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.status === 'completed' ? 'bg-green-100 text-green-700' : m.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {m.status === 'completed' ? 'התקיימה' : m.status === 'cancelled' ? 'בוטלה' : 'מתוכננת'}
                  </span>
                </div>
                {m.meetLink && (
                  <a href={m.meetLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                    קישור לפגישה →
                  </a>
                )}
              </div>
            ))}
            {recordings.map((r) => (
              <div key={r.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-sm">{r.title ?? 'הקלטה'}</span>
                  </div>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{r.source}</span>
                </div>
                {r.summary && <p className="text-sm text-gray-700">{r.summary}</p>}
                {r.actionItems && (
                  <div className="bg-yellow-50 rounded p-2 text-xs text-gray-700">
                    <strong>Action items:</strong> {r.actionItems}
                  </div>
                )}
                {r.externalLink && (
                  <a href={r.externalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                    צפייה בהקלטה →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Interactions ── */}
      <InteractionLog entityType="lead" entityId={id} locale={locale} />

      {/* ── Back Link ── */}
      <Link
        href={`/${locale}/leads`}
        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
      >
        <ArrowRight className="h-4 w-4" />
        חזרה לרשימת לידים
      </Link>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={null}
        initialLeadId={lead.id}
        initialLeadName={lead.customerName}
        onSave={(data) => {
          addTask(data as any);
          setTaskDialogOpen(false);
        }}
      />
    </div>
  );
}
