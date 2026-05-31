import { getString, setString } from "@/src/services/storage/mmkv";
import { create } from "zustand";
import type {
  CreateReminderInput,
  Reminder,
  ReminderSettings,
} from "../types/reminder";

const REMINDERS_KEY = "reminders";
const REMINDER_SETTINGS_KEY = "reminder_settings";

const defaultSettings: ReminderSettings = {
  remindersEnabled: true,
  quietHoursStart: "21:00",
  quietHoursEnd: "08:00",
  hapticsEnabled: true,
  tone: "gentle",
};

type ReminderState = {
  reminders: Reminder[];
  settings: ReminderSettings;
  hasHydrated: boolean;
};

type ReminderActions = {
  hydrate: () => void;
  addReminder: (input: CreateReminderInput) => Reminder | null;
  archiveReminder: (id: string) => void;
  updateSettings: (settings: Partial<ReminderSettings>) => void;
};

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = getString(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export const useReminderStore = create<ReminderState & ReminderActions>(
  (set, get) => ({
    reminders: [],
    settings: defaultSettings,
    hasHydrated: false,

    hydrate: () => {
      if (get().hasHydrated) return;
      set({
        reminders: loadJson<Reminder[]>(REMINDERS_KEY, []),
        settings: loadJson<ReminderSettings>(
          REMINDER_SETTINGS_KEY,
          defaultSettings,
        ),
        hasHydrated: true,
      });
    },

    addReminder: (input) => {
      const title = input.title.trim();
      if (!title) return null;

      const now = new Date().toISOString();
      const reminder: Reminder = {
        id: createId(),
        title,
        scheduledAt: input.scheduledAt,
        tone: input.tone ?? get().settings.tone,
        createdAt: now,
        updatedAt: now,
      };

      const reminders = [reminder, ...get().reminders];
      set({ reminders });
      setString(REMINDERS_KEY, JSON.stringify(reminders));
      return reminder;
    },

    archiveReminder: (id) => {
      const now = new Date().toISOString();
      const reminders = get().reminders.map((reminder) =>
        reminder.id === id
          ? { ...reminder, archivedAt: now, updatedAt: now }
          : reminder,
      );
      set({ reminders });
      setString(REMINDERS_KEY, JSON.stringify(reminders));
    },

    updateSettings: (settings) => {
      const next = { ...get().settings, ...settings };
      set({ settings: next });
      setString(REMINDER_SETTINGS_KEY, JSON.stringify(next));
    },
  }),
);
