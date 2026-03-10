# WhatsApp Enquiry Agent — Dubai Tourism & Car Rental

**Candidate:** Hemant Kadam  
**Role:** AI Automation Engineer — Synops Labs Assessment

A dual-vertical WhatsApp enquiry agent for a Dubai company operating in **tourism packages** and **car rentals**. It accepts incoming messages, routes them by vertical and category, generates AI responses, logs leads, and escalates complex enquiries to human agents.

---

## What I Built

### 1. Intake & Routing ✓

- **Webhook**: `POST /api/webhook` receives incoming WhatsApp messages (or manual trigger).
- **Vertical detection**: Tourism | Car Rental | Unknown.
- **Category classification**:
  - **Tourism**: Package Enquiry, Visa Query, Flight & Hotel Booking, Desert Safari & Excursions, Group Booking
  - **Car Rental**: Vehicle Availability, Pricing & Duration, Chauffeur Request, Booking Confirmation, Cancellation

### 2. AI Response Generation ✓

- Uses **Google Gemini** (Claude/OpenAI equivalent) with structured JSON output.
- Premium Dubai tourism tone — warm, confident, helpful.
- Escalation for high-value/complex cases (group 10+, rental 7+ days, cancellation, VIP tone, low confidence) with a 3-line **staff brief** for handoff.

### 3. Lead Capture & CRM Logging ✓

- **MongoDB**: Every enquiry logged (customer name, message, vertical, category, AI response, timestamp, escalate flag). Persistent storage for dashboard and analytics.
- **Airtable**: Optional. Logs every enquiry with customer name, message, vertical, category, AI response, timestamp, Escalated Lead (Yes/No), Staff Follow-up Needed (Yes/No). Filter by Escalated Lead = Yes for staff follow-up.

### 4. Multilingual Detection ✓

- Arabic vs English detection via Unicode range (`\u0600-\u06FF`).
- AI responds in the same language as the customer.

### 5. Extra Feature: Live Operations Dashboard ✓

**Why this helps a 50-person WhatsApp team:**

- **Test Chat**: Managers can send test messages and see AI responses without using WhatsApp. Instant validation of prompts and routing.
- **Category Suggestions**: One-click chips (Desert Safari, Visa Query, Group 12+, Car Rental 10 days, etc.) mapped to real categories — great for training staff on what triggers what.
- **Escalation Flow**: When an enquiry is escalated, the UI shows the flow (Customer → AI detects trigger → Staff brief → Human takes over). Helps staff understand when and why handoffs happen.
- **Real-time view**: Filter by Tourism / Car Rental / Escalated; see stats and full conversation context.

At scale, teams need to train, demo, and triage without waiting for live WhatsApp traffic. This dashboard reduces that friction.

---

## Architecture

```
Incoming message → POST /api/webhook
    → Language detection (Arabic/English)
    → Gemini: vertical + category + response + escalate + staffBrief
    → Save to MongoDB
    → Return response
```

**Dashboard** (`/dashboard`): Test chat, suggestion chips, enquiry table, detail panel with escalation flow.

---

## Key Decisions

| Decision | Reason |
|----------|--------|
| Coded workflow (Next.js API) vs n8n | Self-contained, deployable anywhere. Webhook can be triggered by n8n, Zapier, or WhatsApp Business API. |
| Gemini over OpenAI/Claude | Same capability; JSON mode (`responseMimeType`) ensures parseable output; cost-effective. |
| MongoDB only | Single source of truth for enquiries, dashboard, and future CRM/analytics. |
| LLM-based routing | More accurate than keyword rules for vague or mixed-intent messages. |

---

## Routes

### `POST /api/webhook`

**Request:**
```json
{
  "messageText": "Need desert safari for 4 people",
  "customerPhone": "+971501234567",
  "customerName": "Sara"
}
```

**Response:**
```json
{
  "id": "uuid",
  "vertical": "Tourism",
  "category": "Desert Safari & Excursions",
  "confidence": 92,
  "escalate": false,
  "estimatedValue": "Medium",
  "customerMood": "Excited",
  "response": "Welcome! Our *Desert Safari* packages...",
  "staffBrief": null,
  "reply": "..."
}
```

### `GET /api/logs`

Returns latest 200 enquiries from MongoDB (for dashboard).

---

## Running Locally

```bash
npm install
cp .env.example .env
# Edit .env with GEMINI_API_KEY, MONGODB_URI, and optionally Airtable vars
npm run dev
```

- App: http://localhost:3000  
- Dashboard: http://localhost:3000/dashboard  

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Google AI API key |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `AIRTABLE_API_TOKEN` | Airtable Personal Access Token (optional) |
| `AIRTABLE_BASE_ID` | Airtable base ID from URL (optional) |
| `AIRTABLE_TABLE_ID` | Table name or ID, e.g. `Enquiries` (optional) |

### Airtable Setup

Create a table with columns: **Customer Name**, **Message**, **Vertical**, **Category**, **AI Response**, **Timestamp**, **Status**, **Phone**, **Language**, **Confidence**, **Estimated Value**, **Customer Mood**, **Escalated** (checkbox), **Staff Brief**. Filter by Status = "Escalated" for staff follow-up.

---

## Assumptions

- WhatsApp provider sends `messageText` and `customerPhone`; `customerName` is optional.
- Arabic detection is Unicode-based; no full Arabic NLP.
- Escalation rules: group 10+, rental 7+ days, cancellation dispute, VIP tone, confidence &lt; 60.
- No multi-turn context yet; each message is processed independently.

---

## n8n Integration (Optional)

1. n8n Webhook node receives WhatsApp payload.
2. HTTP Request node `POST`s to `https://your-app.com/api/webhook` with:
   - `messageText` (string)
   - `customerPhone` (string)
   - `customerName` (optional)
3. Response contains `reply` for sending back to the customer.

---

## What I Would Add With More Time

- Multi-turn conversation memory (per phone number).
- OpenAI/Claude as fallback if Gemini is down.
- WhatsApp template messages and delivery status.
- Role-based dashboard (agent vs manager view).
- Arabic-specific embeddings for better intent detection.

---

## Loom Walkthrough (5–7 min)

Suggested script for a non-technical client:

1. **Problem**: Manual WhatsApp handling, inconsistent, high cost.
2. **Solution**: AI agent that routes, responds, and escalates.
3. **Demo**: Open dashboard → use suggestion chips → show vertical/category/response → pick escalated item → explain escalation flow.
4. **Logging**: Show MongoDB storing enquiries (dashboard pulls from DB).
5. **Arabic**: Send a message in Arabic, show response in Arabic.

---

## Submission

- **To**: info@synopslabs.com  
- **Subject**: Assessment Submission – Hemant Kadam
