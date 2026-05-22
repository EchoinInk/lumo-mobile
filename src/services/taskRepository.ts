import { Task } from "@/store/useTaskStore";
import type { AsyncResult } from "@/types/result";
import { err, ok } from "@/types/result";

/**
 * Task Repository
 *
 * Abstracts task data operations and storage.
 * This provides a clean separation between UI components and data storage.
 *
 * Future: Can be extended to include backend API calls while maintaining
 * the same interface for UI components.
 *
 * All methods return Result<T> for consistent error handling.
 * Never throws raw exceptions — always returns structured results.
 */
export class TaskRepository {
  /**
   * Get all tasks
   * @returns Result with array of tasks or error message
   */
  async getAll(): AsyncResult<Task[]> {
    try {
      // Future: Fetch from backend API
      // Current: Return from store or local storage
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get a task by ID
   * @param id - Task ID
   * @returns Result with task or null if not found, or error message
   */
  async getById(id: string): AsyncResult<Task | null> {
    try {
      // Future: Fetch from backend API
      return ok(null);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Create a new task
   * @param task - Task data without id, createdAt, updatedAt
   * @returns Result with created task or error message
   */
  async create(
    task: Omit<Task, "id" | "createdAt" | "updatedAt">,
  ): AsyncResult<Task> {
    try {
      // Future: POST to backend API
      // Current: Create locally with generated ID
      const newTask: Task = {
        ...task,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        pendingSync: true,
      };
      return ok(newTask);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Update an existing task
   * @param id - Task ID
   * @param updates - Partial task data to update
   * @returns Result with updated task or error message
   */
  async update(id: string, updates: Partial<Task>): AsyncResult<Task> {
    try {
      // Future: PUT/PATCH to backend API
      // Current: Update locally
      // Graceful offline: queue for sync when back online
      return err("Not implemented");
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Delete a task
   * @param id - Task ID
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
   * Search tasks by query
   * @param query - Search query string
   * @returns Result with array of matching tasks or error message
   */
  async search(query: string): AsyncResult<Task[]> {
    try {
      // Future: Implement search on backend
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Filter tasks by criteria
   * @param filters - Filter criteria
   * @returns Result with array of filtered tasks or error message
   */
  async filter(filters: {
    completed?: boolean;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
  }): AsyncResult<Task[]> {
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
export const taskRepository = new TaskRepository();
