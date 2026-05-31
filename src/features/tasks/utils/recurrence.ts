import type { RecurrencePattern, Weekday } from "../types/recurrence";

const weekdays: Weekday[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatDateOnly(value: Date): string {
  return value.toISOString().split("T")[0];
}

export function summarizeRecurrence(pattern?: RecurrencePattern): string {
  if (!pattern || pattern.type === "none") return "Does not repeat";

  if (pattern.type === "daily") {
    const interval = pattern.interval ?? 1;
    return interval === 1 ? "Every day" : `Every ${interval} days`;
  }

  if (pattern.type === "weekly") {
    const interval = pattern.interval ?? 1;
    const selected = pattern.weekdays ?? [];

    if (selected.length === 5 && selected.every((day) => day !== "Sun" && day !== "Sat")) {
      return "Weekdays";
    }

    if (selected.length === 1 && interval === 1) {
      return `Every ${selected[0]}`;
    }

    if (selected.length > 0 && interval === 1) {
      return `Every ${selected.join(", ")}`;
    }

    return interval === 1 ? "Every week" : `Every ${interval} weeks`;
  }

  const interval = pattern.interval ?? 1;
  return interval === 1 ? "Every month" : `Every ${interval} months`;
}

export function getNextOccurrence(
  fromDate: string,
  pattern?: RecurrencePattern,
): string | null {
  if (!pattern || pattern.type === "none") return null;

  const date = parseDateOnly(fromDate);
  const next = new Date(date);

  if (pattern.type === "daily") {
    next.setUTCDate(date.getUTCDate() + (pattern.interval ?? 1));
    return formatDateOnly(next);
  }

  if (pattern.type === "weekly") {
    const selected = pattern.weekdays ?? [];
    if (selected.length === 0) {
      next.setUTCDate(date.getUTCDate() + 7 * (pattern.interval ?? 1));
      return formatDateOnly(next);
    }

    for (let offset = 1; offset <= 14 * (pattern.interval ?? 1); offset++) {
      next.setTime(date.getTime());
      next.setUTCDate(date.getUTCDate() + offset);
      if (selected.includes(weekdays[next.getUTCDay()])) {
        return formatDateOnly(next);
      }
    }
  }

  if (pattern.type === "monthly") {
    next.setUTCMonth(date.getUTCMonth() + (pattern.interval ?? 1));
    return formatDateOnly(next);
  }

  return null;
}
