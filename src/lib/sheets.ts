import { LogEntry } from "@/types";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
const SERVICE_ACCOUNT_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;

async function getGoogleAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const signingInput = `${encode(header)}.${encode(payload)}`;

  const pemKey = SERVICE_ACCOUNT_KEY.replace(/\\n/g, "\n");
  const keyData = pemKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryKey = Buffer.from(keyData, "base64");
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(signingInput)
  );

  const jwt = `${signingInput}.${Buffer.from(signature).toString("base64url")}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

export async function logToSheets(entry: LogEntry): Promise<void> {
  const token = await getGoogleAccessToken();

  const row = [
    entry.id,
    entry.loggedAt,
    entry.customerName,
    entry.phone,
    entry.language,
    entry.messageText,
    entry.vertical,
    entry.category,
    entry.confidence,
    entry.estimatedValue,
    entry.customerMood,
    entry.escalate ? "YES" : "NO",
    entry.response,
    entry.staffBrief || "",
    entry.timestamp,
  ];

  const range = "Sheet1!A:O";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}:append?valueInputOption=RAW`;

  await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ values: [row] }),
  });
}

export const SHEET_HEADERS = [
  "ID", "Logged At", "Customer Name", "Phone", "Language",
  "Message", "Vertical", "Category", "Confidence", "Est. Value",
  "Mood", "Escalated", "AI Response", "Staff Brief", "Message Timestamp"
];
