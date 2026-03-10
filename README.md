# WhatsApp Concierge Agent

> AI-powered dual-vertical WhatsApp agent for Dubai tourism packages and car rentals. Routes enquiries, generates responses, logs leads, and escalates complex cases to human agents.

---

## What I Built

- **Webhook intake** — `POST /api/webhook` receives messages (WhatsApp or manual). Detects vertical (Tourism | Car Rental | Unknown) and category (e.g. Desert Safari, Visa, Vehicle Availability).
- **AI responses** — Google Gemini with structured JSON output; premium Dubai tone; multilingual (Arabic/English).
- **Escalation logic** — Flags group 10+, rental 7+ days, cancellations, VIP tone, low confidence → staff brief for handoff.
- **Lead logging** — MongoDB for persistence; optional Airtable for CRM views.
- **Live dashboard** — Test chat, suggestion chips, enquiry table, escalation flow, knowledge base editing.

---

## Key Decisions

| Decision | Reason |
|----------|--------|
| Coded workflow (Next.js API) vs n8n | Self-contained, deployable anywhere. Webhook can be wired to n8n, Zapier, or WhatsApp Business API. |
| Gemini over OpenAI/Claude | Same capability; JSON mode for parseable output; cost-effective. |
| MongoDB + Airtable | MongoDB for dashboard/analytics; Airtable for CRM and staff follow-up. |
| LLM-based routing | More accurate than keyword rules for vague or mixed-intent messages. |

---

## Assumptions

- WhatsApp provider sends `messageText` and `customerPhone`; `customerName` is optional.
- Arabic detection is Unicode-based (`\u0600-\u06FF`); no full Arabic NLP.
- Escalation rules: group 10+, rental 7+ days, cancellation dispute, VIP tone, confidence &lt; 60.
- No multi-turn context; each message is processed independently.

---

## What I Would Add With More Time

- Multi-turn conversation memory (per phone number).
- OpenAI/Claude fallback if Gemini is down.
- WhatsApp template messages and delivery status.
- Role-based dashboard (agent vs manager view).
- Arabic-specific embeddings for better intent detection.

---

## Quick Start

```bash
npm install
cp .env.example .env   # Add GEMINI_API_KEY, MONGODB_URI
npm run dev
```

- App: http://localhost:3000  
- Dashboard: http://localhost:3000/dashboard  

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── webhook/route.ts   # Main intake & AI processing
│   │   ├── logs/route.ts      # Enquiry list for dashboard
│   │   └── knowledge/route.ts  # Knowledge base CRUD
│   ├── dashboard/page.tsx     # Live ops dashboard
│   ├── layout.tsx
│   └── page.tsx               # Landing → Dashboard
├── lib/
│   ├── gemini.ts              # AI calls
│   ├── language.ts            # Arabic/English detection
│   ├── mongodb.ts
│   ├── airtable.ts
│   ├── knowledge.ts
│   └── store.ts
└── types/index.ts
```

---

## API

**POST /api/webhook**

```json
// Request
{ "messageText": "Desert safari for 4", "customerPhone": "+971501234567", "customerName": "Sara" }

// Response
{ "id": "uuid", "vertical": "Tourism", "category": "Desert Safari & Excursions",
  "confidence": 92, "escalate": false, "response": "Welcome! Our *Desert Safari*...", "reply": "..." }
```

**GET /api/logs** — Latest 200 enquiries (for dashboard).

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Required. Google AI API key |
| `MONGODB_URI` | Required. MongoDB Atlas connection |
| `AIRTABLE_API_TOKEN` | Optional. Airtable PAT |
| `AIRTABLE_BASE_ID` | Optional. Base ID from URL |
| `AIRTABLE_TABLE_ID` | Optional. Table name, e.g. `Enquiries` |

---

## n8n Integration

1. Webhook node receives WhatsApp payload.
2. HTTP Request: `POST https://your-app.com/api/webhook` with `messageText`, `customerPhone`, `customerName`.
3. Use `reply` from response to send back to the customer.

---

*Candidate: Hemant Kadam · AI Automation Engineer — Synops Labs Assessment*
