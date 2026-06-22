import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { DbAutomation } from "@/lib/supabase/types";

// Called by Vercel cron every hour: checks scheduled automations
// and executes those whose scheduleTime matches the current Israel time.

export const dynamic = "force-dynamic";

function getIsraelTime() {
  const now = new Date();
  const israel = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
  const hh = String(israel.getHours()).padStart(2, "0");
  const mm = String(israel.getMinutes()).padStart(2, "0");
  const dateStr = israel.toISOString().split("T")[0]; // YYYY-MM-DD
  return { time: `${hh}:${mm}`, date: dateStr, hour: israel.getHours(), minute: israel.getMinutes() };
}

function isTimeMatch(scheduled: string, current: { hour: number; minute: number }): boolean {
  const [h, m] = scheduled.split(":").map(Number);
  return h === current.hour && current.minute < 10; // match within first 10 min of hour
}

export async function GET(req: NextRequest) {
  // Verify cron secret header (Vercel injects this automatically)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    },
  );

  const { time, date, hour, minute } = getIsraelTime();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  // Load all active scheduled automations
  const { data: automations } = await supabase
    .from("automations")
    .select("*")
    .eq("active", true)
    .eq("trigger", "scheduled");

  if (!automations || automations.length === 0) {
    return NextResponse.json({ ok: true, ran: 0, time });
  }

  let ran = 0;

  for (const auto of automations as DbAutomation[]) {
    const cfg = (auto.trigger_config ?? {}) as Record<string, unknown>;
    const scheduleTime = (cfg.scheduleTime as string) ?? "09:00";

    if (!isTimeMatch(scheduleTime, { hour, minute })) continue;

    const steps = (auto.steps ?? []) as Array<{ action: string; config: Record<string, string> }>;

    for (const step of steps) {
      if (step.action === "send_whatsapp") {
        const templateName = step.config.whatsappTemplateName;
        const templateLanguage = step.config.whatsappTemplateLanguage ?? "he";
        if (!templateName) continue;

        // Find leads with meetings today
        const startOfDay = `${date}T00:00:00.000Z`;
        const endOfDay = `${date}T23:59:59.999Z`;

        const { data: meetings } = await supabase
          .from("meetings")
          .select("lead_id, title, scheduled_at, leads(full_name, phone)")
          .gte("scheduled_at", startOfDay)
          .lte("scheduled_at", endOfDay)
          .not("lead_id", "is", null);

        for (const meeting of meetings ?? []) {
          const lead = (meeting as unknown as { leads: { full_name: string; phone: string } }).leads;
          if (!lead?.phone) continue;

          await fetch(`${baseUrl}/api/whatsapp/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              to: lead.phone,
              templateName,
              templateLanguage,
              bodyParams: [lead.full_name],
            }),
          });
          ran++;
        }
      }

      if (step.action === "notify") {
        // Log a notification for all active leads (or specific condition)
        const message = step.config.message ?? "תזכורת יומית מהמערכת";
        try {
          await supabase.from("activity_log").insert({
            action: "notify",
            entity: "automation",
            entity_id: auto.id,
            label: message,
            created_at: new Date().toISOString(),
          });
        } catch { /* activity_log may not exist yet */ }
        ran++;
      }
    }

    // Update run_count
    await supabase
      .from("automations")
      .update({
        run_count: (auto.run_count ?? 0) + 1,
        last_run_at: new Date().toISOString(),
      })
      .eq("id", auto.id);
  }

  return NextResponse.json({ ok: true, ran, time });
}
