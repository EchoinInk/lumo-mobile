import type { Task } from "@/src/features/tasks/types/task";

export function getTasksForCalendarDate(tasks: Task[], selectedDate: string): Task[] {
  return tasks.filter(
    (task) => !task.deletedAt && task.dueDate === selectedDate,
  );
}
