import { LogEntry } from "@/types";
import { getChatsCollection } from "./mongodb";

export async function addEntry(entry: LogEntry): Promise<void> {
  const coll = await getChatsCollection();
  await coll.insertOne(entry);
}

export async function getEntries(): Promise<LogEntry[]> {
  const coll = await getChatsCollection();
  const docs = await coll
    .find({})
    .sort({ loggedAt: -1 })
    .limit(200)
    .toArray();
  return docs as LogEntry[];
}
