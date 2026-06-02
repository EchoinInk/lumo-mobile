import { getTasksForCalendarDate } from "@/features/calendar/utils/calendarTasks";
import type { Task } from "@/features/tasks/types/task";
import { assertEqual } from "../testUtils";

const baseTask: Task = {
  id: "task",
  title: "Task",
  completed: false,
  priority: "medium",
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

export function testCalendarShowsFutureDatedTasks(): void {
  const tasks = getTasksForCalendarDate(
    [
      { ...baseTask, id: "tomorrow", dueDate: "2026-06-04" },
      { ...baseTask, id: "today", dueDate: "2026-06-03" },
    ],
    "2026-06-04",
  );

  assertEqual(tasks.length, 1, "calendar should show tasks for selected date");
  assertEqual(tasks[0]?.id, "tomorrow", "future task should be visible");
}

export function testCalendarHidesDeletedTasks(): void {
  const tasks = getTasksForCalendarDate(
    [{ ...baseTask, id: "deleted", dueDate: "2026-06-04", deletedAt: "now" }],
    "2026-06-04",
  );

  assertEqual(tasks.length, 0, "deleted tasks should stay hidden");
}
