import { useBrainDump } from "@/src/features/brain-dump";
import { useHabits } from "@/src/features/habits";
import { useReminders } from "@/src/features/reminders";
import { useTasks } from "@/src/features/tasks";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  composeDailyPlanningSummary,
  getBrainDumpReviewQueue,
  getEveningCarryOverItems,
  getGentleCarryOverItems,
  getLowEnergyOptions,
  getSuggestedNextSteps,
} from "../services/planningComposer";
import {
  createEmptyDailySummary,
  loadDailyPlanningSummary,
  persistDailyPlanningSummary,
} from "../services/planningStorage";
import type {
  DailyPlanningSummary,
  PlanningEnergyLevel,
  PlanningFlowMode,
  PlanningNextStep,
  PlanningSourceType,
} from "../types/planning";

function todayIso(): string {
  return new Date().toISOString().split("T")[0];
}

function shiftTaskDate(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
}

export function useDailyPlanningFlow(mode: PlanningFlowMode = "morning") {
  const { tasks, updateTask, hasHydrated: tasksHydrated } = useTasks();
  const { openEntries, archiveEntry, hasHydrated: brainDumpHydrated } =
    useBrainDump();
  const { reminders, hasHydrated: remindersHydrated } = useReminders();
  const { todayHabits, isHydrated: habitsHydrated } = useHabits();

  const [summary, setSummary] = useState<DailyPlanningSummary>(
    createEmptyDailySummary,
  );
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  useEffect(() => {
    const stored = loadDailyPlanningSummary();
    setSummary(stored ?? createEmptyDailySummary());
    setSummaryLoaded(true);
  }, []);

  const persistSummary = useCallback((next: DailyPlanningSummary) => {
    setSummary(next);
    persistDailyPlanningSummary(next);
  }, []);

  const energyLevel = summary.energyLevel;
  const routineLabels = useMemo(
    () => todayHabits.map((habit) => habit.title),
    [todayHabits],
  );

  const composerInput = useMemo(
    () => ({
      tasks,
      reminders,
      routineLabels,
      brainDumpEntries: openEntries,
      energyLevel,
      today: todayIso(),
    }),
    [tasks, reminders, routineLabels, openEntries, energyLevel],
  );

  const carryOverItems = useMemo(
    () => {
      const parkedSourceIds = new Set([
        ...summary.parkedIds,
        ...summary.eveningParkedIds,
      ]);
      const items =
        mode === "evening"
          ? getEveningCarryOverItems(tasks)
          : getGentleCarryOverItems(tasks);
      return items.filter((item) => !parkedSourceIds.has(item.sourceId));
    },
    [tasks, mode, summary.parkedIds, summary.eveningParkedIds],
  );
  const brainDumpQueue = useMemo(
    () => getBrainDumpReviewQueue(openEntries),
    [openEntries],
  );
  const nextStepOptions = useMemo(
    () => {
      const parkedSourceIds = new Set([
        ...summary.parkedIds,
        ...summary.eveningParkedIds,
      ]);
      return getSuggestedNextSteps(composerInput).filter(
        (step) => !parkedSourceIds.has(step.sourceId),
      );
    },
    [composerInput, summary.parkedIds, summary.eveningParkedIds],
  );
  const lowEnergyOptions = useMemo(
    () => {
      const parkedSourceIds = new Set([
        ...summary.parkedIds,
        ...summary.eveningParkedIds,
      ]);
      return getLowEnergyOptions(composerInput).filter(
        (option) => !parkedSourceIds.has(option.sourceId),
      );
    },
    [composerInput, summary.parkedIds, summary.eveningParkedIds],
  );

  const selectedNextStep = useMemo((): PlanningNextStep | undefined => {
    if (summary.nextStepId) {
      const fromNext = nextStepOptions.find(
        (step) => step.id === summary.nextStepId,
      );
      if (fromNext) return fromNext;

      const fromLow = lowEnergyOptions.find(
        (option) => option.id === summary.nextStepId,
      );
      if (fromLow) {
        return {
          id: fromLow.id,
          label: fromLow.label,
          sourceType: fromLow.sourceType,
          sourceId: fromLow.sourceId,
          effort: fromLow.effort,
          reason: fromLow.reason,
        };
      }
    }

    if (summary.nextStepId) {
      return undefined;
    }

    return energyLevel === "low" ? undefined : nextStepOptions[0];
  }, [summary.nextStepId, nextStepOptions, lowEnergyOptions, energyLevel]);

  const isHydrated =
    tasksHydrated &&
    brainDumpHydrated &&
    remindersHydrated &&
    habitsHydrated &&
    summaryLoaded;

  const chooseEnergyLevel = useCallback(
    (level: PlanningEnergyLevel) => {
      const next = composeDailyPlanningSummary(
        { ...composerInput, energyLevel: level },
        { ...summary, energyLevel: level },
      );
      persistSummary(next);
    },
    [composerInput, summary, persistSummary],
  );

  const chooseNextStep = useCallback(
    (stepId: string) => {
      persistSummary({ ...summary, nextStepId: stepId });
    },
    [summary, persistSummary],
  );

  const carryOverItem = useCallback(
    (sourceId: string) => {
      updateTask(sourceId, { dueDate: todayIso() });
      persistSummary({
        ...summary,
        carryOverIds: [...new Set([...summary.carryOverIds, `carry-${sourceId}`])],
      });
    },
    [summary, updateTask, persistSummary],
  );

  const carryToTomorrow = useCallback(
    (sourceId: string) => {
      updateTask(sourceId, { dueDate: shiftTaskDate(1) });
      const carriedIds = [...new Set([...summary.carryOverIds, `carry-${sourceId}`])];
      const eveningCarriedIds =
        mode === "evening"
          ? [...new Set([...summary.eveningCarriedIds, sourceId])]
          : summary.eveningCarriedIds;
      persistSummary({
        ...summary,
        carryOverIds: carriedIds,
        eveningCarriedIds,
      });
    },
    [summary, updateTask, persistSummary, mode],
  );

  const parkItem = useCallback(
    (sourceId: string, sourceType: PlanningSourceType = "task") => {
      const parkedSelectedNextStep =
        summary.nextStepId &&
        (nextStepOptions.find((step) => step.id === summary.nextStepId)
          ?.sourceId === sourceId ||
          lowEnergyOptions.find((option) => option.id === summary.nextStepId)
            ?.sourceId === sourceId);

      if (sourceType === "task") {
        updateTask(sourceId, { dueDate: shiftTaskDate(7) });
      } else if (sourceType === "brainDump") {
        archiveEntry(sourceId);
      }

      if (mode === "evening" && sourceType === "task") {
        persistSummary({
          ...summary,
          nextStepId: parkedSelectedNextStep ? undefined : summary.nextStepId,
          parkedIds: [...new Set([...summary.parkedIds, sourceId])],
          eveningParkedIds: [
            ...new Set([...summary.eveningParkedIds, sourceId]),
          ],
        });
        return;
      }

      persistSummary({
        ...summary,
        nextStepId: parkedSelectedNextStep ? undefined : summary.nextStepId,
        parkedIds: [...new Set([...summary.parkedIds, sourceId])],
      });
    },
    [
      updateTask,
      archiveEntry,
      mode,
      summary,
      nextStepOptions,
      lowEnergyOptions,
      persistSummary,
    ],
  );

  const markEveningBrainDumpVisited = useCallback(() => {
    persistSummary({ ...summary, eveningBrainDumpVisited: true });
  }, [summary, persistSummary]);

  const resetMorningPlan = useCallback(() => {
    persistSummary({ ...summary, morningCompleted: false });
  }, [summary, persistSummary]);

  const resetEveningReset = useCallback(() => {
    persistSummary({ ...summary, eveningCompleted: false });
  }, [summary, persistSummary]);

  const completeMorningPlan = useCallback(() => {
    const next = composeDailyPlanningSummary(composerInput, {
      ...summary,
      morningCompleted: true,
    });
    persistSummary(next);
  }, [composerInput, summary, persistSummary]);

  const completeEveningReset = useCallback(() => {
    persistSummary({ ...summary, eveningCompleted: true });
  }, [summary, persistSummary]);

  const morningComplete = summary.morningCompleted;
  const showEveningReset =
    mode === "evening" ||
    (summary.morningCompleted && !summary.eveningCompleted) ||
    (new Date().getHours() >= 18 && !summary.eveningCompleted);

  return {
    mode,
    energyLevel,
    summary,
    carryOverItems,
    brainDumpQueue,
    nextStepOptions,
    lowEnergyOptions,
    selectedNextStep,
    morningComplete,
    showEveningReset,
    isHydrated,
    chooseEnergyLevel,
    chooseNextStep,
    carryOverItem,
    carryToTomorrow,
    parkItem,
    markEveningBrainDumpVisited,
    resetMorningPlan,
    resetEveningReset,
    completeMorningPlan,
    completeEveningReset,
  };
}
