import { getString, setString } from "@/src/services/storage/mmkv";
import type { DailyPlanningSummary } from "../types/planning";

const PLANNING_SUMMARY_KEY = "daily_planning_summary";

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

export function loadDailyPlanningSummary(): DailyPlanningSummary | null {
  try {
    const raw = getString(PLANNING_SUMMARY_KEY);
    if (!raw) return null;
    const summary = JSON.parse(raw) as DailyPlanningSummary;
    if (summary.date !== todayIso()) {
      return {
        date: todayIso(),
        selectedFocusIds: [],
        carryOverIds: [],
        brainDumpQueueIds: [],
        morningCompleted: false,
        eveningCompleted: false,
      };
    }
    return summary;
  } catch {
    return null;
  }
}

export function persistDailyPlanningSummary(
  summary: DailyPlanningSummary,
): void {
  setString(PLANNING_SUMMARY_KEY, JSON.stringify(summary));
}

export function createEmptyDailySummary(): DailyPlanningSummary {
  return {
    date: todayIso(),
    selectedFocusIds: [],
    carryOverIds: [],
    brainDumpQueueIds: [],
    morningCompleted: false,
    eveningCompleted: false,
  };
}
