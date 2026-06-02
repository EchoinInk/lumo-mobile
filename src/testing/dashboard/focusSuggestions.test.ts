import { getFocusSuggestions } from "@/src/features/dashboard/utils/focusSuggestions";
import type { Task } from "@/src/features/tasks/types/task";
import { assertEqual } from "../testUtils";

const baseTask: Task = {
  id: "task",
  title: "Task",
  completed: false,
  priority: "medium",
  createdAt: "2026-05-31T00:00:00.000Z",
  updatedAt: "2026-05-31T00:00:00.000Z",
};

export function testFocusSuggestionsPreferLowEnergyOptions(): void {
  const suggestions = getFocusSuggestions([
    { ...baseTask, id: "high", title: "Hard task", energyRequired: "high" },
    { ...baseTask, id: "low", title: "Tiny task", energyRequired: "low" },
  ]);

  assertEqual(
    suggestions[0]?.task.id,
    "low",
    "low energy options should be suggested first",
  );
}

export function testFocusSuggestionsLimitVisibleComplexity(): void {
  const suggestions = getFocusSuggestions(
    [1, 2, 3, 4].map((index) => ({
      ...baseTask,
      id: `task-${index}`,
      title: `Task ${index}`,
    })),
    10,
  );

  assertEqual(suggestions.length, 3, "focus suggestions should cap at 3");
}

export function testFocusSuggestionsExcludeDeferredTasks(): void {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const suggestions = getFocusSuggestions([
    { ...baseTask, id: "today", title: "Visible today" },
    {
      ...baseTask,
      id: "tomorrow",
      title: "Deferred",
      dueDate: tomorrow,
    },
  ]);

  assertEqual(suggestions.length, 1, "deferred tasks should leave Today Focus");
  assertEqual(suggestions[0]?.task.id, "today", "today task should remain");
}
