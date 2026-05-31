import { getString, setString } from "@/src/services/storage/mmkv";
import type { BrainDumpEntry } from "../types/brainDump";

const STORAGE_KEY = "brain_dump_entries";

export function loadBrainDumpEntries(): BrainDumpEntry[] {
  try {
    const raw = getString(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BrainDumpEntry[]) : [];
  } catch {
    return [];
  }
}

export function persistBrainDumpEntries(entries: BrainDumpEntry[]): void {
  setString(STORAGE_KEY, JSON.stringify(entries));
}
