export type ReminderScheduleOptionId =
  | "later_today"
  | "tomorrow"
  | "weekend"
  | "none";

export interface ReminderScheduleOption {
  id: ReminderScheduleOptionId;
  label: string;
  accessibilityLabel: string;
}

export const reminderScheduleOptions: ReminderScheduleOption[] = [
  {
    id: "later_today",
    label: "Later today",
    accessibilityLabel: "Remind me later today",
  },
  {
    id: "tomorrow",
    label: "Tomorrow",
    accessibilityLabel: "Remind me tomorrow",
  },
  {
    id: "weekend",
    label: "This weekend",
    accessibilityLabel: "Remind me this weekend",
  },
  {
    id: "none",
    label: "No time",
    accessibilityLabel: "Save reminder without a time",
  },
];

function atLocalTime(date: Date, hours: number, minutes = 0): Date {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function getReminderScheduledAt(
  optionId: ReminderScheduleOptionId,
  now = new Date(),
): string | undefined {
  if (optionId === "none") return undefined;

  if (optionId === "later_today") {
    const laterToday = new Date(now);
    laterToday.setHours(now.getHours() + 2, 0, 0, 0);
    return laterToday.toISOString();
  }

  if (optionId === "tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return atLocalTime(tomorrow, 9).toISOString();
  }

  const weekend = new Date(now);
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
  weekend.setDate(now.getDate() + daysUntilSaturday);
  return atLocalTime(weekend, 10).toISOString();
}
