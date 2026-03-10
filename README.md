# Synops Labs - WhatsApp Enquiry Agent (Next.js + TS)

This repo contains the core WhatsApp enquiry agent for a Dubai tourism + car rental business. It accepts a message payload, detects the vertical and category, responds in English or Arabic, logs leads to Airtable (or Sheets webhook), and flags high-value enquiries for human follow-up.

## What I built

- **Webhook handler**: `POST /api/webhook` processes inbound WhatsApp messages.
- **Dual-vertical routing**: Tourism vs Car Rental + subcategory classification.
- **AI responses**: OpenAI or Anthropic (Claude) with fallback templates.
- **Multilingual detection**: Basic Arabic vs English routing.
- **Lead logging**: Airtable by default, or Google Sheets webhook.
- **Escalation path**: Group bookings and long-term/driver requests trigger handoff with a clean summary.
- **Extra feature (my choice)**: **Ticket ID + priority tagging**. Every enquiry gets a ticket ID and a priority level (low/normal/high). This makes it easier for a 50-agent team to triage quickly and track response SLAs in WhatsApp or CRM.

## Key decisions

- **Coded workflow instead of n8n**: The system is implemented as a Next.js API route to keep the core logic self-contained and deployable. It can be placed behind an n8n webhook or WhatsApp provider.
- **Rule-based classification**: Lightweight keyword routing for speed and clarity; can be upgraded to LLM-based classification later.
- **Airtable logging**: Simple REST integration, configurable by environment variables. Google Sheets is supported via a webhook endpoint (Apps Script or n8n).

## Routes

`POST /api/webhook`

Request body:

```json
{
  "text": "Need a desert safari for 4 people",
  "customerName": "Sara",
  "customerPhone": "+971501234567",
  "timestamp": "2026-03-09T10:05:00Z"
}
```

Response:

```json
{
  "ok": true,
  "ticketId": "DX-20260309-8K3TQZ",
  "language": "en",
  "escalated": false,
  "priority": "low",
  "vertical": "tourism",
  "category": "desert_safari_excursions",
  "response": "...",
  "handoffSummary": null
}
```

## Running locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Environment variables

- `LLM_PROVIDER`: `openai` or `anthropic`
- `OPENAI_API_KEY`, `OPENAI_MODEL`
- `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`
- `LOG_DESTINATION`: `airtable`, `sheets`, or any other value for console logging
- `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_TABLE`
- `SHEETS_WEBHOOK_URL`: Apps Script or n8n endpoint that appends a row

## n8n integration (optional)

1. Use an n8n Webhook node to receive WhatsApp messages.
2. Add an HTTP Request node that `POST`s to `/api/webhook` with the payload.
3. Optionally connect a Sheets/Airtable node for double logging or staff alerts.

## Assumptions

- WhatsApp provider sends a single message string (no attachments for this demo).
- Arabic detection is Unicode-range based; full NLP is out of scope.
- Long-term rentals and group bookings should be escalated.

## What I would add with more time

- Multi-turn context memory per phone number.
- LLM-based classification for higher accuracy.
- WhatsApp template message sending and delivery status tracking.
- Admin dashboard with filters by ticket ID, priority, and SLA.

## Loom walkthrough

Record a 5-7 minute demo covering:

- The webhook flow and classification logic
- English vs Arabic detection
- Escalation + handoff summary
- Airtable/Sheets logging
- Example messages for tourism and car rental
