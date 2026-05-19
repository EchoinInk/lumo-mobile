import { Habit } from '@/store/useHabitStore';

/**
 * Habit Repository
 * 
 * Abstracts habit data operations and storage.
 * This provides a clean separation between UI components and data storage.
 * 
 * Future: Can be extended to include backend API calls while maintaining
 * the same interface for UI components.
 */
export class HabitRepository {
  /**
   * Get all habits
   * @returns Promise resolving to array of habits
   */
  async getAll(): Promise<Habit[]> {
    // Future: Fetch from backend API
    // Current: Return from store or local storage
    return [];
  }

  /**
   * Get a habit by ID
   * @param id - Habit ID
   * @returns Promise resolving to habit or null if not found
   */
  async getById(id: string): Promise<Habit | null> {
    // Future: Fetch from backend API
    return null;
  }

  /**
   * Create a new habit
   * @param habit - Habit data without id, createdAt, updatedAt, completedDates
   * @returns Promise resolving to created habit
   */
  async create(habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt' | 'completedDates'>): Promise<Habit> {
    // Future: POST to backend API
    // Current: Create locally with generated ID
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      completedDates: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newHabit;
  }

  /**
   * Update an existing habit
   * @param id - Habit ID
   * @param updates - Partial habit data to update
   * @returns Promise resolving to updated habit
   */
  async update(id: string, updates: Partial<Habit>): Promise<Habit> {
    // Future: PUT/PATCH to backend API
    // Current: Update locally
    return {} as Habit;
  }

  /**
   * Delete a habit
   * @param id - Habit ID
   * @returns Promise resolving to boolean indicating success
   */
  async delete(id: string): Promise<boolean> {
    // Future: DELETE to backend API
    // Current: Delete locally
    return true;
  }

  /**
   * Toggle habit completion for a specific date
   * @param id - Habit ID
   * @param date - Date string in ISO format
   * @returns Promise resolving to updated habit
   */
  async toggleCompletion(id: string, date: string): Promise<Habit> {
    // Future: PATCH to backend API
    // Current: Update locally
    return {} as Habit;
  }

  /**
   * Get habits by frequency
   * @param frequency - Habit frequency type
   * @returns Promise resolving to array of habits
   */
  async getByFrequency(frequency: 'daily' | 'weekly' | 'monthly'): Promise<Habit[]> {
    // Future: Implement filtering on backend
    return [];
  }

  /**
   * Get habits for a specific date
   * @param date - Date string in ISO format
   * @returns Promise resolving to array of habits
   */
  async getByDate(date: string): Promise<Habit[]> {
    // Future: Implement filtering on backend
    return [];
  }
}

// Export singleton instance
export const habitRepository = new HabitRepository();
