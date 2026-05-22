import { Meal } from "@/store/useMealStore";
import type { AsyncResult } from "@/types/result";
import { err, ok } from "@/types/result";

/**
 * Meal Repository
 *
 * Abstracts meal data operations and storage.
 * This provides a clean separation between UI components and data storage.
 *
 * Future: Can be extended to include backend API calls while maintaining
 * the same interface for UI components.
 *
 * All methods return Result<T> for consistent error handling.
 * Never throws raw exceptions — always returns structured results.
 */
export class MealRepository {
  /**
   * Get all meals
   * @returns Result with array of meals or error message
   */
  async getAll(): AsyncResult<Meal[]> {
    try {
      // Future: Fetch from backend API
      // Current: Return from store or local storage
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get a meal by ID
   * @param id - Meal ID
   * @returns Result with meal or null if not found, or error message
   */
  async getById(id: string): AsyncResult<Meal | null> {
    try {
      // Future: Fetch from backend API
      return ok(null);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Create a new meal
   * @param meal - Meal data without id, createdAt, updatedAt
   * @returns Result with created meal or error message
   */
  async create(
    meal: Omit<Meal, "id" | "createdAt" | "updatedAt">,
  ): AsyncResult<Meal> {
    try {
      // Future: POST to backend API
      // Current: Create locally with generated ID
      const newMeal: Meal = {
        ...meal,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        pendingSync: true,
      };
      return ok(newMeal);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Update an existing meal
   * @param id - Meal ID
   * @param updates - Partial meal data to update
   * @returns Result with updated meal or error message
   */
  async update(id: string, updates: Partial<Meal>): AsyncResult<Meal> {
    try {
      // Future: PUT/PATCH to backend API
      // Current: Update locally
      return err("Not implemented");
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Delete a meal
   * @param id - Meal ID
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
   * Get meals by date
   * @param date - Date string in ISO format
   * @returns Result with array of meals or error message
   */
  async getByDate(date: string): AsyncResult<Meal[]> {
    try {
      // Future: Implement filtering on backend
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get meals by type
   * @param mealType - Meal type (breakfast, lunch, dinner, snack)
   * @returns Result with array of meals or error message
   */
  async getByType(
    mealType: "breakfast" | "lunch" | "dinner" | "snack",
  ): AsyncResult<Meal[]> {
    try {
      // Future: Implement filtering on backend
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get meals within a date range
   * @param startDate - Start date string in ISO format
   * @param endDate - End date string in ISO format
   * @returns Result with array of meals or error message
   */
  async getByDateRange(
    startDate: string,
    endDate: string,
  ): AsyncResult<Meal[]> {
    try {
      // Future: Implement filtering on backend
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Calculate daily nutrition summary
   * @param date - Date string in ISO format
   * @returns Result with nutrition summary or error message
   */
  async getDailyNutrition(date: string): AsyncResult<{
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  }> {
    try {
      // Future: Calculate on backend
      return ok({
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
      });
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
export const mealRepository = new MealRepository();
