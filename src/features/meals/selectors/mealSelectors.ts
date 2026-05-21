/**
 * Meal Selectors
 * 
 * Derived state selectors for meals.
 * Memoized for performance.
 */

/**
 * Select meals by type
 */
export const selectMealsByType = (meals: any[], type: string) => {
  return meals.filter((meal) => meal.type === type);
};

/**
 * Select meals by date
 */
export const selectMealsByDate = (meals: any[], date: string) => {
  return meals.filter((meal) => meal.date === date);
};

/**
 * Select meals by category
 */
export const selectMealsByCategory = (meals: any[], category: string) => {
  return meals.filter((meal) => meal.category === category);
};
