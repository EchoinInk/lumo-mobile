import {
  getReminderScheduledAt,
} from "@/features/reminders";
import { assert, assertEqual } from "../testUtils";

export function testReminderScheduleTomorrowUsesNextMorning(): void {
  const scheduledAt = getReminderScheduledAt(
    "tomorrow",
    new Date("2026-06-03T10:15:00.000Z"),
  );

  assert(Boolean(scheduledAt), "tomorrow schedule should return a timestamp");
  assertEqual(
    new Date(scheduledAt!).getDate(),
    4,
    "tomorrow schedule should use the next day",
  );
}

export function testReminderScheduleNoneLeavesReminderUnscheduled(): void {
  assertEqual(
    getReminderScheduledAt("none", new Date("2026-06-03T10:15:00.000Z")),
    undefined,
    "no time should not set scheduledAt",
  );
}
