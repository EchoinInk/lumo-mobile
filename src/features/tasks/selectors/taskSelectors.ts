/**
 * Task Selectors
 *
 * Derived state selectors for tasks.
 * Memoized for performance.
 */

/**
 * Select completed tasks
 */
export const selectCompletedTasks = (tasks: any[]) => {
  return tasks.filter((task) => task.status === "completed");
};

/**
 * Select incomplete tasks
 */
export const selectIncompleteTasks = (tasks: any[]) => {
  return tasks.filter((task) => task.status !== "completed");
};

/**
 * Select tasks by category
 */
export const selectTasksByCategory = (tasks: any[], category: string) => {
  return tasks.filter((task) => task.category === category);
};

/**
 * Select tasks by priority
 */
export const selectTasksByPriority = (tasks: any[], priority: string) => {
  return tasks.filter((task) => task.priority === priority);
};

/**
 * Select overdue tasks
 */
export const selectOverdueTasks = (tasks: any[]) => {
  const now = new Date();
  return tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < now && task.status !== "completed";
  });
};
