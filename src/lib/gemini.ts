import { IncomingMessage, AgentResponse } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are a premium Dubai tourism & car rental concierge AI.

RESPOND ONLY WITH VALID JSON — no markdown, no extra text.

Format:
{
  "vertical": "Tourism" | "Car Rental" | "Unknown",
  "category": "<category>",
  "confidence": <0-100>,
  "escalate": <true|false>,
  "estimatedValue": "Low" | "Medium" | "High",
  "customerMood": "Excited" | "Urgent" | "Confused" | "Neutral",
  "response": "<WhatsApp reply to customer>",
  "staffBrief": "<3-line brief if escalated, else null>"
}

Tourism categories: Package Enquiry, Visa Query, Flight & Hotel Booking, Desert Safari & Excursions, Group Booking
Car Rental categories: Vehicle Availability, Pricing & Duration, Chauffeur Request, Booking Confirmation, Cancellation

Escalation rules:
- Group 10+ people → escalate
- Rental 7+ days → escalate
- Cancellation dispute → escalate
- VIP or corporate tone → escalate
- Confidence < 60 → ask one clarifying question, vertical = Unknown

Tone: warm, premium, luxury Dubai brand. Use *bold* for key info (WhatsApp format). Respond in the SAME language as the customer.`;

export async function runGeminiAgent(msg: IncomingMessage): Promise<AgentResponse> {
  const userPrompt = `Customer name: ${msg.customerName || "Unknown"}
Language: ${msg.language}
Message: ${msg.messageText}`;

  const body = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT + "\n\n" + userPrompt }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    }
  };

  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await res.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    const cleaned = raw.replace(/```json\s*|\s*```/g, "").trim();
    const parsed = JSON.parse(cleaned) as AgentResponse;
    if (!parsed.vertical || !["Tourism", "Car Rental", "Unknown"].includes(parsed.vertical)) {
      parsed.vertical = "Unknown";
    }
    return parsed;
  } catch {
    return {
      vertical: "Unknown",
      category: "Parse Error",
      confidence: 0,
      escalate: false,
      estimatedValue: "Low",
      customerMood: "Neutral",
      response: "We apologize for the inconvenience. A member of our team will be in touch shortly.",
      staffBrief: null,
    };
  }
}
