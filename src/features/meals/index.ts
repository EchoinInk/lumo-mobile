/**
 * Meals Feature Index
 * 
 * Central export for meals feature.
 */

// Export new modular architecture
export * from './constants/mealConstants';
export * from './queries/useMealsQuery';
export * from './queries/mealQueryKeys';
export * from './selectors/mealSelectors';
export * from './repositories/mealRepository';

// Re-export existing items when index files are created in subdirectories
// export * from './components';
// export * from './hooks';
// export * from './screens';
// export * from './services';
// export * from './store';
// export * from './types';
// export * from './utils';
