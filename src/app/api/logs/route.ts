import { NextResponse } from "next/server";
import { getEntries } from "@/lib/store";

export async function GET() {
  const entries = getEntries();
  return NextResponse.json(entries);
}
