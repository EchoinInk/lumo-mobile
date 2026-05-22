import { Habit } from "@/store/useHabitStore";
import type { AsyncResult } from "@/types/result";
import { err, ok } from "@/types/result";

/**
 * Habit Repository
 *
 * Abstracts habit data operations and storage.
 * This provides a clean separation between UI components and data storage.
 *
 * Future: Can be extended to include backend API calls while maintaining
 * the same interface for UI components.
 *
 * All methods return Result<T> for consistent error handling.
 * Never throws raw exceptions — always returns structured results.
 */
export class HabitRepository {
  /**
   * Get all habits
   * @returns Result with array of habits or error message
   */
  async getAll(): AsyncResult<Habit[]> {
    try {
      // Future: Fetch from backend API
      // Current: Return from store or local storage
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get a habit by ID
   * @param id - Habit ID
   * @returns Result with habit or null if not found, or error message
   */
  async getById(id: string): AsyncResult<Habit | null> {
    try {
      // Future: Fetch from backend API
      return ok(null);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Create a new habit
   * @param habit - Habit data without id, createdAt, updatedAt, completedDates
   * @returns Result with created habit or error message
   */
  async create(
    habit: Omit<Habit, "id" | "createdAt" | "updatedAt" | "completedDates">,
  ): AsyncResult<Habit> {
    try {
      // Future: POST to backend API
      // Current: Create locally with generated ID
      const newHabit: Habit = {
        ...habit,
        id: crypto.randomUUID(),
        completedDates: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        pendingSync: true,
      };
      return ok(newHabit);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Update an existing habit
   * @param id - Habit ID
   * @param updates - Partial habit data to update
   * @returns Result with updated habit or error message
   */
  async update(id: string, updates: Partial<Habit>): AsyncResult<Habit> {
    try {
      // Future: PUT/PATCH to backend API
      // Current: Update locally
      return err("Not implemented");
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Delete a habit
   * @param id - Habit ID
   * @returns Result with boolean indicating success or error message
   */
  async delete(id: string): AsyncResult<boolean> {
    try {
      // Future: DELETE to backend API
      // Current: Delete locally (soft delete with sync support)
      return ok(true);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Toggle habit completion for a specific date
   * @param id - Habit ID
   * @param date - Date string in ISO format
   * @returns Result with updated habit or error message
   */
  async toggleCompletion(id: string, date: string): AsyncResult<Habit> {
    try {
      // Future: PATCH to backend API
      // Current: Update locally
      return err("Not implemented");
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get habits by frequency
   * @param frequency - Habit frequency type
   * @returns Result with array of habits or error message
   */
  async getByFrequency(
    frequency: "daily" | "weekly" | "monthly",
  ): AsyncResult<Habit[]> {
    try {
      // Future: Implement filtering on backend
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get habits for a specific date
   * @param date - Date string in ISO format
   * @returns Result with array of habits or error message
   */
  async getByDate(date: string): AsyncResult<Habit[]> {
    try {
      // Future: Implement filtering on backend
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Normalize any error into a readable string message.
   * Never expose raw exceptions to the UI.
   */
  private normalizeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "An unexpected error occurred";
  }
}

// Export singleton instance
export const habitRepository = new HabitRepository();
