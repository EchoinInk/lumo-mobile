// Habits Feature
// Local-first habit tracking with daily completion and streaks

// Components
export { HabitFormModal } from './components/HabitFormModal';
export { HabitListItem } from './components/HabitListItem';

// Hooks
export { useHabits } from './hooks/useHabits';

// Types
export type {
  Habit,
  HabitColor,
  HabitFrequency,
  CreateHabitInput,
  UpdateHabitInput,
} from './types/habit';

// Store (for advanced use cases)
export { useHabitStore } from './store/useHabitStore';
