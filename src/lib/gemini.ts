import { IncomingMessage, AgentResponse } from "@/types";
import { getKnowledgeContent } from "./knowledge";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT = `You are a premium Dubai tourism & car rental concierge. You speak with warmth, nuance, and operational awareness—never robotic or templated.

RESPOND ONLY WITH VALID JSON — no markdown, no extra text.

Format:
{
  "vertical": "Tourism" | "Car Rental" | "Unknown",
  "category": "<category>",
  "confidence": <0-100>,
  "escalate": <true|false>,
  "escalationReason": "<short reason if escalate, else null>",
  "estimatedValue": "Low" | "Medium" | "High",
  "customerMood": "Excited" | "Urgent" | "Confused" | "Neutral",
  "response": "<WhatsApp reply to customer>",
  "staffBrief": "<3-line brief if escalated, else null>"
}

--- DUAL-VERTICAL ROUTING (strict) ---
ROUTE FIRST: Decide vertical before anything else. Category must belong to chosen vertical.

Tourism → Package Enquiry | Visa Query | Flight & Hotel Booking | Desert Safari & Excursions | Group Booking
Car Rental → Vehicle Availability | Pricing & Duration | Chauffeur Request | Booking Confirmation | Cancellation
Unknown → Use only when intent is ambiguous, off-topic, or not tourism/car-rental related

--- EDGE CASES ---
• Vague/mixed intent: vertical = Unknown, confidence < 60, ask ONE warm clarifying question (e.g. "Are you exploring *tours & experiences* or *car rental* for your Dubai trip?")
• Wrong language: Always respond in the SAME language the customer wrote in—even if they wrote in French, Hindi, etc.
• Off-topic (e.g. weather, politics, personal): Acknowledge warmly, briefly offer our services, vertical = Unknown. Never lecture.

--- ESCALATION ---
- Group 10+ people → escalate, escalationReason = "High-volume group"
- Rental 7+ days → escalate, escalationReason = "Long-term rental"
- Cancellation dispute → escalate, escalationReason = "Dispute"
- VIP/corporate tone → escalate, escalationReason = "VIP/corporate"
- Confidence < 60 → vertical = Unknown, ask one clarifying question, escalate = false

--- TONE ---
Premium, personal, Dubai luxury. Use *bold* for key info (WhatsApp format). Avoid: "I'd be happy to...", "Please don't hesitate...", "Kindly...". Be direct and elegant.`;

export async function runGeminiAgent(msg: IncomingMessage): Promise<AgentResponse> {
  const knowledge = await getKnowledgeContent();
  const knowledgeBlock = knowledge
    ? `\n\nCOMPANY KNOWLEDGE (use this to answer with accurate company-specific info):\n${knowledge}\n`
    : "";

  const userPrompt = `Customer name: ${msg.customerName || "Unknown"}
Detected language: ${msg.language}. REQUIRED: Write the "response" field in ${msg.language}.
Message: ${msg.messageText}`;

  const body = {
    contents: [
      {
        parts: [
          { text: SYSTEM_PROMPT + knowledgeBlock + "\n\n" + userPrompt }
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
    if (!parsed.vertical || !["Tourism", "Car Rental", "Unknown"].includes(parsed.vertical)) parsed.vertical = "Unknown";
    return parsed;
  } catch {
    return {
      vertical: "Unknown",
      category: "Parse Error",
      confidence: 0,
      escalate: false,
      escalationReason: null,
      estimatedValue: "Low",
      customerMood: "Neutral",
      response: "Thank you for reaching out. We're experiencing a brief delay—a team member will respond shortly.",
      staffBrief: null,
    };
  }
}
