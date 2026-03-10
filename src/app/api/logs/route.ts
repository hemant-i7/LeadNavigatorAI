import { NextResponse } from "next/server";
import { getEntries } from "@/lib/store";

export async function GET() {
  try {
    const entries = await getEntries();
    return NextResponse.json(entries);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Logs API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch logs", detail: process.env.NODE_ENV === "development" ? msg : undefined },
      { status: 500 }
    );
  }
}
