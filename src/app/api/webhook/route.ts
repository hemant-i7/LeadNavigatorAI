import { NextRequest, NextResponse } from "next/server";
import { runGeminiAgent } from "@/lib/gemini";
import { detectLanguage } from "@/lib/language";
import { addEntry } from "@/lib/store";
import { logToAirtable } from "@/lib/airtable";
import { IncomingMessage, LogEntry } from "@/types";
import { randomUUID } from "crypto";

const TEST_CHAT_HTML = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Webhook Test Chat</title>
<style>body{font-family:system-ui;max-width:500px;margin:40px auto;background:#0d0d0d;color:#e8e0d0;padding:20px;}
input,button{display:block;width:100%;padding:12px;margin:8px 0;border-radius:6px;border:1px solid #333;background:#1a1a1a;color:#e8e0d0;}
button{background:#f97316;color:#000;font-weight:600;cursor:pointer;}
#out{background:#141414;padding:12px;margin-top:16px;border-radius:6px;font-size:13px;white-space:pre-wrap;min-height:80px;}
.error{color:#f87171;}</style></head>
<body>
<h2>Webhook Test Chat</h2>
<p>POST to this endpoint. Or use the form below:</p>
<form id="f">
  <input name="messageText" placeholder="Message (e.g. Need desert safari for 4)" required>
  <input name="customerPhone" placeholder="Phone (e.g. +971501234567)" value="test-browser" required>
  <input name="customerName" placeholder="Name (optional)" value="Test User">
  <button type="submit">Send</button>
</form>
<div id="out">Response will appear here.</div>
<script>
document.getElementById('f').onsubmit=async e=>{
  e.preventDefault();
  const fd=new FormData(e.target);
  const out=document.getElementById('out');
  out.className='';out.textContent='Sending...';
  try{
    const r=await fetch('/api/webhook',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messageText:fd.get('messageText'),customerPhone:fd.get('customerPhone'),customerName:fd.get('customerName')})});
    const d=await r.json();
    out.textContent=r.ok?('Reply: '+d.reply+'\n\nVertical: '+d.vertical+', Category: '+d.category):('Error: '+(d.detail||d.error||r.status));
    if(!r.ok)out.className='error';
  }catch(x){out.textContent='Error: '+x.message;out.className='error';}
};
</script>
</body></html>`;

export async function GET() {
  return new NextResponse(TEST_CHAT_HTML, {
    headers: { "Content-Type": "text/html" },
  });
}

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const messageText = String(
      (body.messageText as { body?: string })?.body ??
        body.messageText ??
        body.text ??
        ""
    ).trim();
    const phone = String(body.customerPhone ?? body.phone ?? "").trim();

    if (!messageText || !phone) {
      return NextResponse.json(
        { error: "Missing messageText or customerPhone" },
        { status: 400 }
      );
    }

    const incoming: IncomingMessage = {
      phone,
      messageText,
      customerName: String(body.customerName ?? ""),
      timestamp: new Date().toISOString(),
      phoneNumberId: String(body.phoneNumberId ?? ""),
      language: detectLanguage(messageText),
    };

    const agentResponse = await runGeminiAgent(incoming);

    const entry: LogEntry = {
      id: randomUUID(),
      loggedAt: new Date().toISOString(),
      ...incoming,
      ...agentResponse,
    };

    await addEntry(entry);

    logToAirtable(entry).catch((err) => console.error("Airtable logging failed:", err));

    return NextResponse.json(
      { ...entry, reply: entry.response },
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Agent error:", err);
    return NextResponse.json(
      {
        error: "Agent failed",
        detail: process.env.NODE_ENV === "development" ? msg : undefined,
        response: "We're experiencing a brief interruption. A team member will contact you shortly.",
        reply: "We're experiencing a brief interruption. A team member will contact you shortly.",
        escalate: true,
        escalationReason: "System error",
        vertical: "Unknown",
        category: "Error",
      },
      { status: 500 }
    );
  }
}
