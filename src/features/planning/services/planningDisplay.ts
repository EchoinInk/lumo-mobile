import type { PlanningNextStep } from "@/src/features/planning/types/planning";

export function getPlanningNextStepDisplayLabel(
  nextStep?: PlanningNextStep,
): string | undefined {
  const label = nextStep?.label?.trim();
  if (!label) return undefined;
  if (/^\d+$/.test(label)) return undefined;
  if (/^(undefined|null)$/i.test(label)) return undefined;
  if (label === nextStep?.id || label === nextStep?.sourceId) return undefined;
  return label;
}
