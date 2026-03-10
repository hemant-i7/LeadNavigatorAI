# Developer Guide

## Quick Start

```bash
npm install
cp .env.example .env   # Add GEMINI_API_KEY, MONGODB_URI
npm run dev
```

- App: http://localhost:3000  
- Dashboard: http://localhost:3000/dashboard  

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── webhook/route.ts   # Main intake & AI processing
│   │   ├── logs/route.ts      # Enquiry list for dashboard
│   │   └── knowledge/route.ts # Knowledge base CRUD
│   ├── dashboard/page.tsx    # Live ops dashboard
│   └── page.tsx              # Landing → Dashboard
├── lib/
│   ├── gemini.ts             # AI calls
│   ├── language.ts           # Arabic/English detection
│   ├── mongodb.ts, airtable.ts, knowledge.ts
│   └── store.ts
└── types/index.ts
```

## API

**POST /api/webhook**

```json
// Request
{ "messageText": "Desert safari for 4", "customerPhone": "+971501234567", "customerName": "Sara" }

// Response
{ "id": "uuid", "vertical": "Tourism", "category": "Desert Safari & Excursions",
  "confidence": 92, "escalate": false, "response": "Welcome! Our *Desert Safari*...", "reply": "..." }
```

**GET /api/logs** — Latest 200 enquiries.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Required. Google AI API key |
| `MONGODB_URI` | Required. MongoDB Atlas connection |
| `AIRTABLE_API_TOKEN` | Optional. Airtable PAT |
| `AIRTABLE_BASE_ID` | Optional. Base ID from URL |
| `AIRTABLE_TABLE_ID` | Optional. Table name, e.g. `Enquiries` |

## n8n Integration

1. Webhook node receives WhatsApp payload.
2. HTTP Request: `POST https://your-app.com/api/webhook` with `messageText`, `customerPhone`, `customerName`.
3. Use `reply` from response to send back to the customer.
