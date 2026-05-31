import type { BrainDumpEntry } from "@/src/features/brain-dump/types/brainDump";
import type { Reminder } from "@/src/features/reminders/types/reminder";
import type { Task } from "@/src/features/tasks/types/task";

export type PlanningEnergyLevel = "low" | "medium" | "steady";

export type PlanningFlowMode = "morning" | "evening";

export type PlanningSourceType = "task" | "reminder" | "routine" | "brainDump";

export type PlanningEffort = "tiny" | "easy" | "focused";

export interface PlanningNextStep {
  id: string;
  label: string;
  sourceType: PlanningSourceType;
  sourceId: string;
  effort: PlanningEffort;
  reason: string;
}

export interface CarryOverItem {
  id: string;
  label: string;
  sourceType: PlanningSourceType;
  sourceId: string;
  reason: string;
}

export interface BrainDumpQueueItem {
  id: string;
  label: string;
  sourceId: string;
  reason: string;
}

export interface LowEnergyOption {
  id: string;
  label: string;
  sourceType: PlanningSourceType;
  sourceId: string;
  effort: PlanningEffort;
  reason: string;
}

export interface DailyPlanningSummary {
  date: string;
  selectedFocusIds: string[];
  carryOverIds: string[];
  brainDumpQueueIds: string[];
  nextStepId?: string;
  energyLevel?: PlanningEnergyLevel;
  morningCompleted: boolean;
  eveningCompleted: boolean;
}

export interface PlanningComposerInput {
  tasks: Task[];
  reminders: Reminder[];
  routineLabels: string[];
  brainDumpEntries: BrainDumpEntry[];
  energyLevel?: PlanningEnergyLevel;
  today?: string;
}
