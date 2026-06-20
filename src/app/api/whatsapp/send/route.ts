import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return NextResponse.json(
      { error: "WhatsApp not configured" },
      { status: 503 },
    );
  }

  const body = (await req.json()) as {
    to: string;
    templateName: string;
    templateLanguage: string;
  };

  const { to, templateName, templateLanguage } = body;

  if (!to || !templateName) {
    return NextResponse.json(
      { error: "Missing required fields: to, templateName" },
      { status: 400 },
    );
  }

  const metaRes = await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage || "he" },
        },
      }),
    },
  );

  if (!metaRes.ok) {
    const errorText = await metaRes.text();
    console.error("[api/whatsapp/send] Meta API error:", errorText);
    return NextResponse.json(
      { error: `Meta API error: ${metaRes.status}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
