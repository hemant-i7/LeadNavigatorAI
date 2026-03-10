# WhatsApp Concierge Agent

> A smart receptionist for your WhatsApp. Handles tourism and car rental enquiries 24/7, responds in the customer's language, and hands off to your team when needed.

---

## What I Built

- **Message handling** — When a customer writes, the system understands if they need tours (packages, visas, desert safaris, groups) or car rental (vehicles, pricing, chauffeurs, bookings). If it’s unclear, it asks one gentle clarifying question instead of guessing.
- **AI replies** — Warm, professional Dubai-style responses. Works in Arabic and English.
- **Escalation** — Flags high-value or tricky enquiries (group 10+, rental 7+ days, cancellations, VIP tone) so your staff get a short brief and can take over.
- **Record keeping** — Every enquiry is saved so you can review conversations, filter by type, and follow up.
- **Dashboard** — Test messages, see all enquiries, train staff using suggestion chips, and manage the knowledge the AI uses.

---

## Key Decisions

| Decision | Reason |
|----------|--------|
| Custom-built app instead of no-code only | Runs anywhere, connects to any WhatsApp provider or automation tool. |
| AI routing instead of fixed keywords | Handles vague or mixed messages more accurately. |
| Two storage layers (internal + Airtable) | Internal for your dashboard; Airtable for CRM and staff follow-up if you use it. |

---

## Assumptions

- Messages come with the text and phone number; customer name can be added when available.
- Arabic is detected by script only; no advanced language understanding.
- Escalation rules: group 10+, rental 7+ days, cancellation disputes, VIP tone, or low confidence.
- Each message is handled on its own; no conversation memory yet.

---

## What I Would Add With More Time

- Conversation memory so the AI remembers prior messages from the same customer.
- Backup AI if the main one is unavailable.
- Read receipts and delivery status in WhatsApp.
- Different dashboard views for agents vs managers.
- Stronger Arabic understanding.

---

## For Developers

See [DEVELOPER.md](./DEVELOPER.md) for setup, API details, and technical notes.

---

*Candidate: Hemant Kadam · AI Automation Engineer — Synops Labs Assessment*
