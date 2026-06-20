import type { Automation, AutomationTrigger } from "@/lib/types";

const AUTOMATIONS_KEY = "crm-automations";

export interface LeadPayload {
  id: string;
  customerName: string;
  phone?: string;
  customerEmail?: string;
  company?: string;
  status: string;
  createdAt: string;
}

function loadAutomations(): Automation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(AUTOMATIONS_KEY);
    return raw ? (JSON.parse(raw) as Automation[]) : [];
  } catch {
    return [];
  }
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
    const automations = loadAutomations();
    const matching = automations.filter((a) => a.active && a.trigger === trigger);

    for (const automation of matching) {
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
