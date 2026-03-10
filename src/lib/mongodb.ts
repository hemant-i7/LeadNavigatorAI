import { MongoClient, Db, Collection } from "mongodb";
import { LogEntry } from "@/types";

const uri = process.env.MONGODB_URI;
let client: MongoClient | null = null;

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!client) client = new MongoClient(uri);
  await client.connect();
  return client.db();
}

export function getChatsCollection(): Promise<Collection<LogEntry>> {
  return getDb().then((db) => db.collection<LogEntry>("chats"));
}

export function getKnowledgeCollection() {
  return getDb().then((db) => db.collection<{ id: string; content: string; updatedAt: string }>("knowledge_base"));
}
