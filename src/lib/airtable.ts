import { LogEntry } from "@/types";

const API_TOKEN = process.env.AIRTABLE_API_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_TABLE_ID;

export async function logToAirtable(entry: LogEntry): Promise<void> {
  if (!API_TOKEN || !BASE_ID || !TABLE_ID) {
    if (!API_TOKEN) console.warn("Airtable: AIRTABLE_API_TOKEN not set");
    if (!TABLE_ID) console.warn("Airtable: AIRTABLE_TABLE_ID not set");
    return;
  }
  const fields: Record<string, string> = {
    "Customer Name": entry.customerName || "",
    "Enquiry Message": entry.messageText,
    "Vertical": entry.vertical,
    "Category": entry.category,
    "AI Response": entry.response,
    "Timestamp": entry.loggedAt,
    "Escalated Lead": entry.escalate ? "Yes" : "No",
    "Staff Follow-up Needed": entry.escalate ? "Yes" : "No",
    ...(entry.escalate && entry.escalationReason && { "Escalation Reason": entry.escalationReason }),
  };
  const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_ID)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ fields }] }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Airtable API error:", res.status, err);
    throw new Error(`Airtable API error: ${err}`);
  }
}
