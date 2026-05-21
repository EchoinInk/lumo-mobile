/**
 * Meal Constants
 * 
 * Feature-specific constants for meals.
 */

export const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  SNACK: 'snack',
} as const;

export const MEAL_CATEGORIES = {
  HOME_COOKED: 'home_cooked',
  RESTAURANT: 'restaurant',
  TAKEOUT: 'takeout',
  OTHER: 'other',
} as const;
