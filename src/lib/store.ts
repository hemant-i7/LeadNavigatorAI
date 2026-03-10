import { LogEntry } from "@/types";

const STORE: LogEntry[] = [];

export function addEntry(entry: LogEntry): void {
  STORE.unshift(entry);
  if (STORE.length > 500) STORE.pop();
}

export function getEntries(): LogEntry[] {
  return STORE.slice(0, 200);
}
