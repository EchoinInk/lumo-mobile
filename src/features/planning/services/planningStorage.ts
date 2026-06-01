import { getString, setString } from "@/src/services/storage/mmkv";
import { StorageKeys } from "@/src/services/storage/storageKeys";
import type { DailyPlanningSummary, PlanningEnergyLevel } from "../types/planning";

const VALID_ENERGY_LEVELS = new Set<PlanningEnergyLevel>([
  "low",
  "medium",
  "steady",
]);

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function sanitizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function normalizeDailyPlanningSummary(
  summary: Partial<DailyPlanningSummary>,
): DailyPlanningSummary {
  const energyLevel =
    summary.energyLevel &&
    VALID_ENERGY_LEVELS.has(summary.energyLevel as PlanningEnergyLevel)
      ? summary.energyLevel
      : undefined;

  return {
    date: typeof summary.date === "string" ? summary.date : todayIso(),
    selectedFocusIds: sanitizeStringArray(summary.selectedFocusIds),
    carryOverIds: sanitizeStringArray(summary.carryOverIds),
    brainDumpQueueIds: sanitizeStringArray(summary.brainDumpQueueIds),
    nextStepId:
      typeof summary.nextStepId === "string" ? summary.nextStepId : undefined,
    energyLevel,
    morningCompleted: summary.morningCompleted === true,
    eveningCompleted: summary.eveningCompleted === true,
    eveningCarriedIds: sanitizeStringArray(summary.eveningCarriedIds),
    eveningParkedIds: sanitizeStringArray(summary.eveningParkedIds),
    eveningBrainDumpVisited: summary.eveningBrainDumpVisited === true,
  };
}

export function loadDailyPlanningSummary(): DailyPlanningSummary | null {
  try {
    const raw = getString(StorageKeys.PLANNING_SUMMARY);
    if (!raw) return null;
    const summary = normalizeDailyPlanningSummary(
      JSON.parse(raw) as DailyPlanningSummary,
    );
    if (summary.date !== todayIso()) {
      return createEmptyDailySummary();
    }
    return summary;
  } catch {
    return null;
  }
}

export function persistDailyPlanningSummary(
  summary: DailyPlanningSummary,
): void {
  setString(StorageKeys.PLANNING_SUMMARY, JSON.stringify(summary));
}

export function createEmptyDailySummary(): DailyPlanningSummary {
  return normalizeDailyPlanningSummary({ date: todayIso() });
}
