// Next.js 14 API Route: app/api/whatsapp/route.ts
// POST /api/whatsapp — sends a WhatsApp message (simulated)
import { NextRequest, NextResponse } from "next/server";

interface WhatsAppPayload {
  phone: string;
  message: string;
}

// ---------- simulated WhatsApp API ----------
async function sendWhatsApp(phone: string, message: string): Promise<{ ok: boolean; msgId: string }> {
  // Replace this block with a real WhatsApp Business API / Twilio / WATI call
  const simulated = Math.random() > 0.1; // 90 % success for demo

  await new Promise((r) => setTimeout(r, 400)); // simulate network latency

  if (!simulated) {
    throw new Error("WhatsApp API returned 503 (simulated)");
  }

  return { ok: true, msgId: `wa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}` };
}
// -------------------------------------------

export async function POST(req: NextRequest) {
  try {
    // 1. Auth check (placeholder — wire up your real auth middleware here)
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401 });
    }
    // TODO: validate token against your auth provider (NextAuth, Clerk, Supabase, etc.)

    // 2. Parse body
    const body: WhatsAppPayload = await req.json();

    if (!body.phone || !body.message) {
      return NextResponse.json({ error: "phone and message are required" }, { status: 400 });
    }

    // Basic phone validation (E.164 recommended)
    if (!/^\+?[1-9]\d{6,14}$/.test(body.phone)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    // 3. Send via WhatsApp API
    const result = await sendWhatsApp(body.phone, body.message);

    return NextResponse.json(
      { success: true, msgId: result.msgId, phone: body.phone },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[whatsapp] send failed:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
