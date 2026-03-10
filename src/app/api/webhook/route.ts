import { NextRequest, NextResponse } from "next/server";
import { runGeminiAgent } from "@/lib/gemini";
import { logToSheets } from "@/lib/sheets";
import { addEntry } from "@/lib/store";
import { IncomingMessage, LogEntry } from "@/types";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const messageText =
      body.messageText?.body ?? body.messageText ?? "";
    const phone = body.customerPhone ?? body.phone ?? "";

    if (!messageText || !phone) {
      return NextResponse.json(
        { error: "Missing messageText or customerPhone" },
        { status: 400 }
      );
    }

    const incoming: IncomingMessage = {
      phone,
      messageText,
      customerName: body.customerName ?? "",
      timestamp: new Date().toISOString(),
      phoneNumberId: body.phoneNumberId ?? "",
      language: /[\u0600-\u06FF]/.test(messageText) ? "Arabic" : "English",
    };

    const agentResponse = await runGeminiAgent(incoming);

    const entry: LogEntry = {
      id: randomUUID(),
      loggedAt: new Date().toISOString(),
      ...incoming,
      ...agentResponse,
    };

    addEntry(entry);

    logToSheets(entry).catch((err) =>
      console.error("Sheets logging failed:", err)
    );

    return NextResponse.json(
      { ...entry, reply: entry.response },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("Agent error:", err);
    return NextResponse.json(
      {
        error: "Agent failed",
        response: "We're experiencing a brief interruption. A team member will contact you shortly.",
        reply: "We're experiencing a brief interruption. A team member will contact you shortly.",
        escalate: true,
        vertical: "Unknown",
        category: "Error",
      },
      { status: 500 }
    );
  }
}
