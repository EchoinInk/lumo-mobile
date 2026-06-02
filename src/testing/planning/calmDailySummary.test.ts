import { getPlanningNextStepDisplayLabel } from "@/features/planning/components/CalmDailySummary";
import type { PlanningNextStep } from "@/features/planning/types/planning";
import { assertEqual } from "../testUtils";

const baseStep: PlanningNextStep = {
  id: "focus-task-1",
  label: "Drink water",
  sourceType: "task",
  sourceId: "task-1",
  effort: "tiny",
  reason: "One next step",
};

export function testPlanningSummaryUsesHumanReadableNextStepLabel(): void {
  assertEqual(
    getPlanningNextStepDisplayLabel(baseStep),
    "Drink water",
    "planning summary should use the resolved next-step label",
  );
}

export function testPlanningSummaryRejectsRawNumericNextStepLabel(): void {
  assertEqual(
    getPlanningNextStepDisplayLabel({ ...baseStep, label: "2" }),
    undefined,
    "planning summary should not display raw numeric ids",
  );
}

export function testPlanningSummaryRejectsRawIdLabel(): void {
  assertEqual(
    getPlanningNextStepDisplayLabel({ ...baseStep, label: "focus-task-1" }),
    undefined,
    "planning summary should not display raw ids as labels",
  );
}
