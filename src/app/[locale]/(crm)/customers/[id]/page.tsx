"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { FileText, Plus, CheckSquare, ClipboardList, Zap, ArrowRight, FolderKanban, BookOpen, ExternalLink, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomerHeader } from "@/components/customers/customer-header";
import { MetricCards } from "@/components/customers/metric-cards";
import { EngagementFeed } from "@/components/customers/engagement-feed";
import { InteractionLog } from "@/components/shared/interaction-log";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { mockActivities } from "@/lib/mock-data";
import { useCustomers } from "@/hooks/use-customers";
import { useLeads } from "@/hooks/use-leads";
import { useQuotes } from "@/hooks/use-quotes";
import { useTasks } from "@/hooks/use-tasks";
import { useForms } from "@/hooks/use-forms";
import { useAutomations } from "@/hooks/use-automations";
import { useCustomFieldDefinitions } from "@/hooks/use-custom-field-definitions";
import { useCustomFieldValues } from "@/hooks/use-custom-field-values";
import { CustomFieldsSection } from "@/components/custom-fields/custom-fields-section";
import { useProjects } from "@/hooks/use-projects";
import { useQuestionnaires } from "@/hooks/use-questionnaires";
import { ProjectDialog } from "@/components/projects/project-dialog";
import { QuestionnaireDialog } from "@/components/questionnaires/questionnaire-dialog";
import type { Project, QuestionnaireSubmission } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import type { Quote, Task } from "@/lib/types";

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("customers");
  const tq = useTranslations("quotes");
  const locale = useLocale();
  const fmtLocale = locale === "he" ? "he-IL" : "en-US";
  const router = useRouter();
  const { customers, updateCustomer } = useCustomers();
  const { fields: customDefs } = useCustomFieldDefinitions('customer');
  const { values: cfValues, setValue: setCfValue, saveAll: saveCfAll } = useCustomFieldValues(id, 'customer');
  const { leads } = useLeads();
  const { quotes, addQuote, nextSerial } = useQuotes();
  const { getTasksForCustomer, addTask, updateTask, deleteTask } = useTasks();
  const { forms } = useForms();
  const { automations } = useAutomations();
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | undefined>();
  const [questionnaireDialogOpen, setQuestionnaireDialogOpen] = useState(false);
  const [viewQuestionnaire, setViewQuestionnaire] = useState<QuestionnaireSubmission | undefined>();
  const { projects, addProject, updateProject, deleteProject } = useProjects(undefined, id);
  const { submissions, addSubmission, deleteSubmission } = useQuestionnaires(undefined, id);

  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <p>לקוח לא נמצא (ID: {id})</p>
      </div>
    );
  }

  const customerActivities = mockActivities.filter((a) => a.customerId === id);
  const customerQuotes = quotes.filter((q) => q.customerId === id);

  // Compute lifetime value from signed quotes
  const signedQuotesTotal = customerQuotes
    .filter((q) => q.status === "signed")
    .reduce((sum, q) => sum + q.total, 0);
  const computedLifetimeValue = signedQuotesTotal > 0 ? signedQuotesTotal : customer.lifetimeValue;

  // Compute close time (days from lead creation to customer conversion)
  let closeTimeDays: number | null = null;
  if (customer.convertedFromLeadId && customer.convertedAt) {
    const sourceLead = leads.find((l) => l.id === customer.convertedFromLeadId);
    if (sourceLead) {
      const leadCreated = new Date(sourceLead.createdAt).getTime();
      const convertedAt = new Date(customer.convertedAt).getTime();
      closeTimeDays = Math.round((convertedAt - leadCreated) / (1000 * 60 * 60 * 24));
    }
  }

  const handleCreateQuote = () => {
    const now = new Date().toISOString();
    const serial = nextSerial();
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    const newQuote: Quote = {
      id: `quote-${Date.now()}`,
      serialNumber: serial,
      quoteNumber: `Q-${String(serial).padStart(4, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      status: "draft",
      lineItems: [],
      subtotal: 0,
      globalDiscount: 0,
      discountTotal: 0,
      includeVat: true,
      taxRate: 17,
      taxAmount: 0,
      total: 0,
      validUntil: defaultDate.toISOString().slice(0, 10),
      notes: "",
      terms: "",
      sections: [],
      createdAt: now,
      updatedAt: now,
      createdBy: "אני",
      updatedBy: "אני",
      customFields: {},
    };
    addQuote(newQuote);
    router.push(`/${locale}/quotes/${newQuote.id}`);
  };

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}/customers`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
        חזרה ללקוחות
      </Link>
      <CustomerHeader customer={customer} />

      <MetricCards customer={customer} locale={locale} lifetimeValue={computedLifetimeValue} closeTimeDays={closeTimeDays} />

      {/* ── Custom Fields ── */}
      {customDefs.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <CustomFieldsSection
            entityType="customer"
            definitions={customDefs}
            values={cfValues}
            onChangeValue={(key, val) => {
              setCfValue(key, val);
              saveCfAll(customDefs).catch(console.error);
            }}
          />
        </div>
      )}

      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{tq("relatedQuotes")}</h3>
          </div>
          <Button size="sm" onClick={handleCreateQuote}>
            <Plus className="h-4 w-4 me-1.5" />
            {tq("createQuote")}
          </Button>
        </div>
        {customerQuotes.length > 0 ? (
          <div className="space-y-2">
            {customerQuotes.map((q) => (
              <Link
                key={q.id}
                href={`/${locale}/quotes/${q.id}`}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-medium">{q.quoteNumber}</span>
                  <QuoteStatusBadge status={q.status} />
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {new Date(q.createdAt).toLocaleDateString(fmtLocale)}
                  </span>
                  <span className="font-semibold text-secondary">
                    {formatCurrency(q.total, fmtLocale)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {tq("noQuotes")}
          </p>
        )}
      </div>

      {/* ── Linked Forms ── */}
      {(() => {
        const linkedForms = forms.filter((f) => f.linkedCustomerId === id);
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
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                      form.status === "active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                      form.status === "closed" ? "bg-red-100 text-red-700 border-red-200" :
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {form.status === "active" ? "פעיל" : form.status === "closed" ? "סגור" : "טיוטה"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{form.responseCount} תגובות</span>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

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
        {getTasksForCustomer(id).length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">אין משימות ללקוח זה</p>
        ) : (
          <div className="space-y-2">
            {getTasksForCustomer(id).map((task) => (
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

      {/* ── Linked Automations ── */}
      {(() => {
        const CUSTOMER_TRIGGERS = ["customer_created", "quote_sent", "quote_signed"];
        const linkedAutomations = automations.filter((a) =>
          CUSTOMER_TRIGGERS.includes(a.trigger) ||
          (a.trigger === "field_changed" && a.triggerConfig?.entity === "customer")
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

      {/* ── Projects ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <FolderKanban className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold">פרויקטים</h3>
          </div>
          <Button size="sm" variant="outline" onClick={() => { setEditProject(undefined); setProjectDialogOpen(true); }}>
            <Plus className="h-4 w-4 me-1" />
            הוסף פרויקט
          </Button>
        </div>
        {projects.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">אין פרויקטים ללקוח זה</p>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{project.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                      project.status === "active" ? "bg-emerald-100 text-emerald-700" :
                      project.status === "completed" ? "bg-blue-100 text-blue-700" :
                      project.status === "planning" ? "bg-slate-100 text-slate-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      {project.status === "active" ? "פעיל" : project.status === "completed" ? "הושלם" : project.status === "planning" ? "תכנון" : project.status === "on_hold" ? "מושהה" : "בוטל"}
                    </span>
                  </div>
                  {project.priceExclVat != null && (
                    <p className="text-xs text-emerald-600 mt-0.5">₪{Math.round(project.priceExclVat * 1.17).toLocaleString("he-IL")} כולל מע"מ</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {project.specDocUrl && (
                    <a href={project.specDocUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-3.5 w-3.5" /></Button>
                    </a>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditProject(project); setProjectDialogOpen(true); }}>
                    <span className="text-xs">✏️</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteProject(project.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Questionnaires ── */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-violet-500/15 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-violet-600" />
            </div>
            <h3 className="text-lg font-bold">שאלונים</h3>
          </div>
          <Button size="sm" variant="outline" onClick={() => setQuestionnaireDialogOpen(true)}>
            <Plus className="h-4 w-4 me-1" />
            שאלון חדש
          </Button>
        </div>
        {submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">אין שאלונים ללקוח זה</p>
        ) : (
          <div className="space-y-2">
            {submissions.map((sub) => {
              const typeLabel = sub.type === "intro" ? "שאלון היכרות" : sub.type === "business_mapping" ? "מיפוי עסקי" : sub.type === "scalability" ? "סקיילבליות" : "מותאם";
              return (
                <div key={sub.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-violet-500" />
                    <div>
                      <span className="text-sm font-medium">{typeLabel}</span>
                      {sub.submittedAt && (
                        <p className="text-xs text-muted-foreground">{new Date(sub.submittedAt).toLocaleDateString("he-IL")}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewQuestionnaire(sub)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSubmission(sub.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Interactions ── */}
      <InteractionLog entityType="customer" entityId={id} locale={locale} />

      <EngagementFeed activities={customerActivities} title={t("engagementFeed")} />

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        task={null}
        initialCustomerId={customer.id}
        initialCustomerName={customer.name}
        onSave={(data) => {
          addTask(data as any);
          setTaskDialogOpen(false);
        }}
      />

      <ProjectDialog
        open={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        onSave={async (data) => {
          if (editProject) await updateProject(editProject.id, data);
          else await addProject({ ...data, clientId: id });
        }}
        initial={editProject}
        defaultClientId={id}
      />

      <QuestionnaireDialog
        open={questionnaireDialogOpen}
        onClose={() => setQuestionnaireDialogOpen(false)}
        onSave={(data) => addSubmission({ ...data, clientId: id })}
        defaultClientId={id}
      />

      {viewQuestionnaire && (
        <QuestionnaireDialog
          open={true}
          onClose={() => setViewQuestionnaire(undefined)}
          onSave={async () => {}}
          viewOnly={viewQuestionnaire}
        />
      )}
    </div>
  );
}
