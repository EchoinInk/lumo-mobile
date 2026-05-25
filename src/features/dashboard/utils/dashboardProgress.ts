/**
 * Dashboard progress utilities for combining task and habit completion
 */

interface ProgressData {
  totalTodayItems: number;
  completedTodayItems: number;
  completionRate: number;
  supportiveLabel: string;
}

/**
 * Calculate daily progress from tasks and habits
 */
export function calculateDailyProgress(
  taskCount: number,
  completedTasks: number,
  habitCount: number,
  completedHabits: number
): ProgressData {
  const totalTodayItems = taskCount + habitCount;
  const completedTodayItems = completedTasks + completedHabits;
  const completionRate =
    totalTodayItems > 0
      ? Math.round((completedTodayItems / totalTodayItems) * 100)
      : 0;

  const supportiveLabel = getSupportiveLabel(completionRate, totalTodayItems);

  return {
    totalTodayItems,
    completedTodayItems,
    completionRate,
    supportiveLabel,
  };
}

/**
 * Get a supportive, non-punitive label based on completion rate
 */
function getSupportiveLabel(rate: number, total: number): string {
  if (total === 0) {
    return "A quiet day is still a valid day.";
  }

  if (rate === 0) {
    return "Nothing urgent here. Start when you're ready.";
  }

  if (rate < 50) {
    return "You've started. That counts.";
  }

  if (rate < 100) {
    return "You're making steady progress.";
  }

  return "Today's essentials are complete.";
}

/**
 * Get empty state message for tasks
 */
export function getTaskEmptyMessage(): string {
  const messages = [
    "Nothing urgent here.",
    "You can add one small step when you're ready.",
    "A gentle start is still a start.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get empty state message for habits
 */
export function getHabitEmptyMessage(): string {
  const messages = [
    "A gentle routine can help anchor the day.",
    "Small daily habits build steady rhythms.",
    "Routines are optional, but they can be comforting.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get combined empty state message
 */
export function getCombinedEmptyMessage(): string {
  const messages = [
    "Today is a blank canvas. Add what feels right.",
    "A quiet day is still a valid day.",
    "You can add tasks or habits whenever you're ready.",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}
