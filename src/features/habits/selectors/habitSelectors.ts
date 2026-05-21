/**
 * Habit Selectors
 * 
 * Derived state selectors for habits.
 * Memoized for performance.
 */

/**
 * Select active habits
 */
export const selectActiveHabits = (habits: any[]) => {
  return habits.filter((habit) => habit.status === 'active');
};

/**
 * Select paused habits
 */
export const selectPausedHabits = (habits: any[]) => {
  return habits.filter((habit) => habit.status === 'paused');
};

/**
 * Select habits by category
 */
export const selectHabitsByCategory = (habits: any[], category: string) => {
  return habits.filter((habit) => habit.category === category);
};

/**
 * Select habits by frequency
 */
export const selectHabitsByFrequency = (habits: any[], frequency: string) => {
  return habits.filter((habit) => habit.frequency === frequency);
};
