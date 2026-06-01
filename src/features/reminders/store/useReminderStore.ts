import { create } from "zustand";
import {
  loadReminders,
  loadReminderSettings,
  persistReminders,
  persistReminderSettings,
} from "../services/reminderStorage";
import type { CreateReminderInput, Reminder } from "../types/reminder";

type ReminderState = {
  reminders: Reminder[];
  settings: ReturnType<typeof loadReminderSettings>;
  hasHydrated: boolean;
};

type ReminderActions = {
  hydrate: () => void;
  addReminder: (input: CreateReminderInput) => Reminder | null;
  archiveReminder: (id: string) => void;
  updateSettings: (
    settings: Partial<ReturnType<typeof loadReminderSettings>>,
  ) => void;
};

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useReminderStore = create<ReminderState & ReminderActions>(
  (set, get) => ({
    reminders: [],
    settings: loadReminderSettings(),
    hasHydrated: false,

    hydrate: () => {
      if (get().hasHydrated) return;
      set({
        reminders: loadReminders(),
        settings: loadReminderSettings(),
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
      persistReminders(reminders);
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
      persistReminders(reminders);
    },

    updateSettings: (settings) => {
      const next = { ...get().settings, ...settings };
      set({ settings: next });
      persistReminderSettings(next);
    },
  }),
);
