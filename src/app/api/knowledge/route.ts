import { NextRequest, NextResponse } from "next/server";
import { getKnowledgeCollection } from "@/lib/mongodb";

export async function GET() {
  try {
    const coll = await getKnowledgeCollection();
    const doc = await coll.findOne({ id: "company" });
    return NextResponse.json({ content: doc?.content || "" });
  } catch (err) {
    console.error("Knowledge fetch error:", err);
    return NextResponse.json({ content: "" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();
    const coll = await getKnowledgeCollection();
    await coll.updateOne(
      { id: "company" },
      { $set: { id: "company", content: String(content || ""), updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Knowledge save error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
