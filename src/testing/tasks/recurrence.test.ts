import { assertEqual } from "../testUtils";
import {
  getNextOccurrence,
  summarizeRecurrence,
} from "@/src/features/tasks/utils/recurrence";

export function testRecurrenceSummariesStayHumanReadable(): void {
  assertEqual(
    summarizeRecurrence({ type: "daily", interval: 1 }),
    "Every day",
    "daily recurrence should be readable",
  );
  assertEqual(
    summarizeRecurrence({ type: "weekly", weekdays: ["Mon"] }),
    "Every Mon",
    "single weekday recurrence should be readable",
  );
  assertEqual(
    summarizeRecurrence({ type: "weekly", interval: 2 }),
    "Every 2 weeks",
    "flexible weekly recurrence should be readable",
  );
  assertEqual(
    summarizeRecurrence({
      type: "weekly",
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    }),
    "Weekdays",
    "weekday recurrence should collapse to Weekdays",
  );
}

export function testRecurrenceCalculatesNextDates(): void {
  assertEqual(
    getNextOccurrence("2026-06-01", { type: "daily", interval: 2 }),
    "2026-06-03",
    "daily interval should advance by days",
  );
  assertEqual(
    getNextOccurrence("2026-06-01", { type: "weekly", weekdays: ["Wed"] }),
    "2026-06-03",
    "selected weekday recurrence should find the next selected day",
  );
  assertEqual(
    getNextOccurrence("2026-06-01", { type: "monthly", interval: 1 }),
    "2026-07-01",
    "monthly recurrence should advance by months in UTC",
  );
}

export function testMonthlyRecurrenceSummaryIsReadable(): void {
  assertEqual(
    summarizeRecurrence({ type: "monthly", interval: 1 }),
    "Every month",
    "monthly recurrence should be readable",
  );
  assertEqual(
    summarizeRecurrence({ type: "monthly", interval: 2 }),
    "Every 2 months",
    "monthly interval recurrence should be readable",
  );
}
