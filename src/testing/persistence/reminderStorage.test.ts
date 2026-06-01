import {
  loadReminderSettings,
  loadReminders,
  sanitizeReminderSettings,
  sanitizeReminders,
} from "@/features/reminders/services/reminderStorage";
import { deleteKey, setString } from "@/services/storage/mmkv";
import { StorageKeys } from "@/services/storage/storageKeys";
import { assertEqual, resetTestState } from "../testUtils";

export async function testSanitizeReminderSettingsFallsBackToDefaults(): Promise<void> {
  const settings = sanitizeReminderSettings({
    remindersEnabled: "yes",
    tone: "loud",
    quietHoursStart: 21,
  });

  assertEqual(settings.remindersEnabled, true, "invalid boolean should fall back");
  assertEqual(settings.tone, "gentle", "invalid tone should fall back");
  assertEqual(settings.quietHoursStart, "21:00", "invalid quiet hours should fall back");
}

export async function testSanitizeRemindersFiltersInvalidRecords(): Promise<void> {
  const reminders = sanitizeReminders([
    {
      id: "ok",
      title: "Stretch",
      tone: "gentle",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    { id: "bad", title: "" },
  ]);

  assertEqual(reminders.length, 1, "invalid reminders should be filtered");
  assertEqual(reminders[0]?.title, "Stretch", "valid reminder should remain");
}

export async function testLoadReminderSettingsHandlesCorruptJson(): Promise<void> {
  resetTestState();
  setString(StorageKeys.REMINDER_SETTINGS, "{bad");

  const settings = loadReminderSettings();
  assertEqual(settings.tone, "gentle", "corrupt settings should use defaults");
  assertEqual(settings.remindersEnabled, true, "corrupt settings should keep safe defaults");
}

export async function testLoadRemindersHandlesCorruptJson(): Promise<void> {
  resetTestState();
  deleteKey(StorageKeys.REMINDERS);
  setString(StorageKeys.REMINDERS, "[]]");

  assertEqual(loadReminders().length, 0, "corrupt reminders json should return []");
}
