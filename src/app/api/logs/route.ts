import { NextResponse } from "next/server";
import { getEntries } from "@/lib/store";

export async function GET() {
  const entries = await getEntries();
  return NextResponse.json(entries);
}
