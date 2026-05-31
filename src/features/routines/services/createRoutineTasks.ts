import type { CreateTaskInput } from "@/src/features/tasks/types/task";
import type { RoutineBundle } from "../types/routineBundle";

export function createTasksFromBundle(bundle: RoutineBundle): CreateTaskInput[] {
  return bundle.items.map((item) => ({
    title: item.title,
    description: item.description,
    priority: "low",
    energyRequired: "low",
  }));
}
