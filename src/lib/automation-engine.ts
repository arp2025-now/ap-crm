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

function checkConditions(conditions: AutomationCondition[], lead: LeadPayload): boolean {
  return conditions.every((cond) => {
    const val = (lead as unknown as Record<string, unknown>)[cond.field];
    const strVal = val === undefined || val === null ? "" : String(val);
    switch (cond.operator) {
      case "equals": return strVal === (cond.value ?? "");
      case "not_equals": return strVal !== (cond.value ?? "");
      case "contains": return strVal.includes(cond.value ?? "");
      case "not_contains": return !strVal.includes(cond.value ?? "");
      case "is_empty": return strVal === "";
      case "is_not_empty": return strVal !== "";
      default: return true;
    }
  });
}

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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

async function executeWebhook(
  url: string,
  method: string,
  payload: object,
): Promise<void> {
  try {
    const res = await fetch(url, {
      method: method || "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(
        `[automation-engine] webhook failed: ${res.status} ${url}`,
      );
    }
  } catch (err) {
    console.error(`[automation-engine] webhook error:`, err);
  }
}

async function executeWhatsApp(
  templateName: string,
  templateLanguage: string,
  phone: string,
): Promise<void> {
  try {
    const res = await fetch("/api/whatsapp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateName, templateLanguage, to: phone }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(
        `[automation-engine] whatsapp failed: ${res.status} ${text}`,
      );
    }
  } catch (err) {
    console.error(`[automation-engine] whatsapp error:`, err);
  }
}

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
            await executeWebhook(url, cfg.webhookMethod ?? "POST", {
              trigger,
              lead,
            });
          }

          if (step.action === "send_whatsapp") {
            const templateName = cfg.whatsappTemplateName;
            const templateLanguage = cfg.whatsappTemplateLanguage ?? "he";
            const phoneField = cfg.whatsappPhoneField ?? "phone";
            const phone = (lead as unknown as Record<string, unknown>)[
              phoneField
            ] as string | undefined;
            if (!templateName || !phone) {
              console.error(
                `[automation-engine] send_whatsapp missing templateName or phone`,
              );
              continue;
            }
            await executeWhatsApp(templateName, templateLanguage, phone);
          }
        } catch (err) {
          console.error(
            `[automation-engine] step error in automation "${automation.name}":`,
            err,
          );
        }
      }
    }
  } catch (err) {
    console.error(`[automation-engine] runAutomations error:`, err);
  }
}
