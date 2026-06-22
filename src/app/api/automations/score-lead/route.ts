import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Anthropic not configured" }, { status: 503 });
  }

  const { leadId, leadData, criteria } = (await req.json()) as {
    leadId: string;
    leadData: {
      customerName?: string;
      company?: string;
      status?: string;
      notes?: string;
      pipelineValue?: number;
      heatLevel?: string;
    };
    criteria?: string;
  };

  if (!leadId || !leadData) {
    return NextResponse.json({ error: "Missing leadId or leadData" }, { status: 400 });
  }

  const scoringCriteria = criteria ||
    "לקוחות עסקים קטנים ובינוניים בישראל שצריכים אוטומציה ו-CRM. ציון גבוה = בעל פוטנציאל עסקי גבוה.";

  const prompt = `אתה מנהל מכירות מנוסה. דרג ליד זה מ-1 עד 10 לפי הפוטנציאל העסקי שלו.

מידע על הליד:
- שם: ${leadData.customerName ?? "לא ידוע"}
- חברה: ${leadData.company ?? "לא ידוע"}
- סטטוס: ${leadData.status ?? "חדש"}
- הערות: ${leadData.notes ?? "אין"}
- שווי עסקה משוער: ${leadData.pipelineValue ? `${leadData.pipelineValue} ₪` : "לא ידוע"}
- רמת חום: ${leadData.heatLevel ?? "לא ידוע"}

קריטריונים לניקוד:
${scoringCriteria}

החזר JSON בלבד: {"score": <1-10>, "reason": "<הסבר קצר בעברית>"}`;

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      console.error("[score-lead] Anthropic error:", await anthropicRes.text());
      return NextResponse.json({ error: "AI scoring failed" }, { status: 500 });
    }

    const aiData = (await anthropicRes.json()) as {
      content: { text: string }[];
    };
    const text = aiData.content[0]?.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in AI response");

    const { score } = JSON.parse(jsonMatch[0]) as { score: number; reason: string };
    const numericScore = Math.min(10, Math.max(1, Math.round(score)));

    // Update lead's ai_score in Supabase using service role
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

    await supabase
      .from("leads")
      .update({ ai_score: numericScore, updated_at: new Date().toISOString() })
      .eq("id", leadId);

    return NextResponse.json({ ok: true, score: numericScore });
  } catch (err) {
    console.error("[score-lead] error:", err);
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 });
  }
}
