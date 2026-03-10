import { getKnowledgeCollection } from "./mongodb";

export async function getKnowledgeContent(): Promise<string> {
  try {
    const coll = await getKnowledgeCollection();
    const doc = await coll.findOne({ id: "company" });
    return doc?.content?.trim() || "";
  } catch {
    return "";
  }
}
