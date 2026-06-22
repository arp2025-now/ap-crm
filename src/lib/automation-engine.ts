import type { Automation, AutomationTrigger, AutomationCondition } from "@/lib/types";
import type { DbAutomation } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";

export interface LeadPayload {
  id: string;
  customerName: string;
  phone?: string;
  customerEmail?: string;
  company?: string;
  status: string;
  heatLevel?: string;
  pipelineValue?: number;
  notes?: string;
  assignedAgentId?: string;
  createdAt: string;
  changedFields?: string[]; // populated on lead_updated
}

// ── Condition evaluation ──

function checkConditions(conditions: AutomationCondition[], lead: LeadPayload): boolean {
  return conditions.every((cond) => {
    const val = (lead as unknown as Record<string, unknown>)[cond.field];
    const strVal = val === undefined || val === null ? "" : String(val);
    switch (cond.operator) {
      case "equals":      return strVal === (cond.value ?? "");
      case "not_equals":  return strVal !== (cond.value ?? "");
      case "contains":    return strVal.includes(cond.value ?? "");
      case "not_contains":return !strVal.includes(cond.value ?? "");
      case "is_empty":    return strVal === "";
      case "is_not_empty":return strVal !== "";
      default:            return true;
    }
  });
}

// ── Template variable substitution ──
// Replaces {{name}}, {{company}}, {{phone}}, {{date}} etc. from lead data

function interpolate(template: string, lead: LeadPayload): string {
  const vars: Record<string, string> = {
    name:    lead.customerName ?? "",
    company: lead.company ?? "",
    phone:   lead.phone ?? "",
    email:   lead.customerEmail ?? "",
    status:  lead.status ?? "",
    value:   lead.pipelineValue ? String(lead.pipelineValue) : "",
    date:    new Date().toLocaleDateString("he-IL"),
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

// ── Load active automations ──

async function loadAutomations(): Promise<Automation[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("automations")
    .select("*")
    .eq("active", true);
  if (!data) return [];
  return (data as DbAutomation[]).map((row) => ({
    id: row.id,
    name: row.name,
    description: "",
    active: row.active,
    trigger: row.trigger as Automation["trigger"],
    triggerConfig: (row.trigger_config ?? {}) as Automation["triggerConfig"],
    steps: (row.steps ?? []) as unknown as Automation["steps"],
    runCount: row.run_count,
    lastRunAt: row.last_run_at ?? undefined,
    isPreset: row.is_preset ?? false,
    makeScenarioId: row.make_scenario_id ?? undefined,
    category: row.category ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// ── Action executors ──

async function executeWebhook(url: string, method: string, payload: object): Promise<void> {
  try {
    const res = await fetch(url, {
      method: method || "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.error(`[automation-engine] webhook failed: ${res.status} ${url}`);
  } catch (err) {
    console.error(`[automation-engine] webhook error:`, err);
  }
}

async function executeWhatsApp(
  templateName: string,
  templateLanguage: string,
  phone: string,
  bodyParams?: string[],
): Promise<void> {
  try {
    const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL ?? "");
    const res = await fetch(`${baseUrl}/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateName, templateLanguage, to: phone, bodyParams }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`[automation-engine] whatsapp failed: ${res.status} ${text}`);
    }
  } catch (err) {
    console.error(`[automation-engine] whatsapp error:`, err);
  }
}

async function executeScoreLeadAI(lead: LeadPayload, criteria: string): Promise<void> {
  try {
    const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL ?? "");
    await fetch(`${baseUrl}/api/automations/score-lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: lead.id, leadData: lead, criteria }),
    });
  } catch (err) {
    console.error(`[automation-engine] score_lead_ai error:`, err);
  }
}

async function executeCreateTask(
  lead: LeadPayload,
  title: string,
  description: string,
): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("tasks").insert({
      title: interpolate(title, lead),
      details: description ? interpolate(description, lead) : null,
      status: "todo",
      priority: "medium",
      lead_id: lead.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error(`[automation-engine] create_task error:`, err);
  }
}

async function executeNotify(lead: LeadPayload, message: string): Promise<void> {
  // Stores an in-app notification in Supabase activity log
  try {
    const supabase = createClient();
    await supabase.from("activity_log").insert({
      action: "notify",
      entity: "automation",
      entity_id: lead.id,
      label: interpolate(message, lead),
      created_at: new Date().toISOString(),
    });
  } catch {
    // Silently ignore if activity_log table doesn't exist yet
  }
}

async function executeSendEmail(
  lead: LeadPayload,
  emailTo: string,
  subject: string,
  body: string,
): Promise<void> {
  try {
    const baseUrl = typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_APP_URL ?? "");
    await fetch(`${baseUrl}/api/automations/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: emailTo || lead.customerEmail,
        subject: interpolate(subject, lead),
        body: interpolate(body, lead),
        leadName: lead.customerName,
      }),
    });
  } catch (err) {
    console.error(`[automation-engine] send_email error:`, err);
  }
}

// ── Main runner ──

export async function runAutomations(
  trigger: AutomationTrigger,
  lead: LeadPayload,
): Promise<void> {
  try {
    const automations = await loadAutomations();
    const matching = automations.filter((a) => a.trigger === trigger);

    for (const automation of matching) {
      // For lead_updated: skip if the changed field isn't one we're watching
      if (trigger === "lead_updated") {
        const watched = automation.triggerConfig?.watchedFields ?? [];
        if (watched.length > 0) {
          const changed = lead.changedFields ?? [];
          const hasMatch = watched.some((f) => changed.includes(f));
          if (!hasMatch) continue;
        }
      }

      // Check conditions / filters
      const conditions = automation.triggerConfig?.conditions ?? [];
      if (conditions.length > 0 && !checkConditions(conditions, lead)) continue;

      for (const step of automation.steps) {
        try {
          const cfg = step.config;

          if (step.action === "send_webhook") {
            const url = cfg.webhookUrl;
            if (!url) continue;
            await executeWebhook(url, cfg.webhookMethod ?? "POST", { trigger, lead });
          }

          if (step.action === "send_whatsapp") {
            const templateName = cfg.whatsappTemplateName;
            const templateLanguage = cfg.whatsappTemplateLanguage ?? "he";
            const phoneField = cfg.whatsappPhoneField ?? "phone";
            const phone = (lead as unknown as Record<string, unknown>)[phoneField] as string | undefined;
            if (!templateName || !phone) {
              console.error(`[automation-engine] send_whatsapp: missing template or phone`);
              continue;
            }
            // Build body params from comma-separated field names
            const bodyParamFields = cfg.whatsappBodyParams
              ? cfg.whatsappBodyParams.split(",").map((f) => f.trim())
              : [];
            const bodyParams = bodyParamFields.length > 0
              ? bodyParamFields.map((f) => String((lead as unknown as Record<string, unknown>)[f] ?? ""))
              : undefined;
            await executeWhatsApp(templateName, templateLanguage, phone, bodyParams);
          }

          if (step.action === "score_lead_ai") {
            const criteria = cfg.aiScoringCriteria ?? "";
            await executeScoreLeadAI(lead, criteria);
          }

          if (step.action === "create_task") {
            const title = cfg.taskTitle ?? "משימה מאוטומציה";
            const desc = cfg.taskDescription ?? "";
            await executeCreateTask(lead, title, desc);
          }

          if (step.action === "notify") {
            const message = cfg.message ?? "";
            if (message) await executeNotify(lead, message);
          }

          if (step.action === "send_email") {
            const to = cfg.emailTo ?? "";
            const subject = cfg.emailSubject ?? "";
            const body = cfg.emailBody ?? "";
            await executeSendEmail(lead, to, subject, body);
          }

        } catch (err) {
          console.error(`[automation-engine] step error in "${automation.name}":`, err);
        }
      }
    }
  } catch (err) {
    console.error(`[automation-engine] runAutomations error:`, err);
  }
}
