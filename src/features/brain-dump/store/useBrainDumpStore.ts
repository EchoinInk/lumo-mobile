import { create } from "zustand";
import {
  loadBrainDumpEntries,
  persistBrainDumpEntries,
} from "../services/brainDumpStorage";
import type {
  BrainDumpConversionTarget,
  BrainDumpEntry,
  BrainDumpStatus,
  CreateBrainDumpInput,
} from "../types/brainDump";

type BrainDumpState = {
  entries: BrainDumpEntry[];
  hasHydrated: boolean;
};

type BrainDumpActions = {
  hydrate: () => void;
  addEntry: (input: CreateBrainDumpInput) => BrainDumpEntry | null;
  convertEntry: (
    id: string,
    target: BrainDumpConversionTarget,
    linkedEntityId?: string,
  ) => void;
  archiveEntry: (id: string) => void;
  clearConverted: () => void;
};

type BrainDumpStore = BrainDumpState & BrainDumpActions;

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function persist(entries: BrainDumpEntry[]): void {
  persistBrainDumpEntries(entries);
}

export const useBrainDumpStore = create<BrainDumpStore>((set, get) => ({
  entries: [],
  hasHydrated: false,

  hydrate: () => {
    if (get().hasHydrated) return;
    set({ entries: loadBrainDumpEntries(), hasHydrated: true });
  },

  addEntry: (input) => {
    const text = input.text.trim();
    if (!text) return null;

    const now = new Date().toISOString();
    const entry: BrainDumpEntry = {
      id: createId(),
      text,
      status: "open",
      createdAt: now,
      updatedAt: now,
    };

    const entries = [entry, ...get().entries];
    set({ entries });
    persist(entries);
    return entry;
  },

  convertEntry: (id, target, linkedEntityId) => {
    const now = new Date().toISOString();
    const status: BrainDumpStatus =
      target === "archived_note" ? "archived" : "converted";
    const entries = get().entries.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            status,
            convertedAt: now,
            convertedTo: target,
            linkedEntityId,
            updatedAt: now,
          }
        : entry,
    );
    set({ entries });
    persist(entries);
  },

  archiveEntry: (id) => {
    get().convertEntry(id, "archived_note");
  },

  clearConverted: () => {
    const entries = get().entries.filter((entry) => entry.status === "open");
    set({ entries });
    persist(entries);
  },
}));
