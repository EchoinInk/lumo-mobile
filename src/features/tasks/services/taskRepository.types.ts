import { IRepository } from "@/services/repositories/IRepository";
import { CreateTaskInput, Task, UpdateTaskInput } from "../types/task";

/**
 * Task Repository Interface
 *
 * Domain-specific repository contract for task operations.
 * Extends the generic IRepository with task-specific methods.
 */
export interface ITaskRepository extends IRepository<Task> {
  /**
   * Get all tasks
   * @returns Promise resolving to array of all tasks
   */
  getTasks(): Promise<Task[]>;

  /**
   * Create a new task
   * @param input - Task creation data
   * @returns Promise resolving to created task
   */
  createTask(input: CreateTaskInput): Promise<Task>;

  /**
   * Update an existing task
   * @param id - Task ID
   * @param input - Task update data
   * @returns Promise resolving to updated task
   */
  updateTask(id: string, input: UpdateTaskInput): Promise<Task>;

  /**
   * Soft delete a task (sets deletedAt timestamp)
   * @param id - Task ID
   * @returns Promise resolving when deletion is complete
   */
  deleteTask(id: string): Promise<void>;

  /**
   * Hard delete a task (removes from storage)
   * @param id - Task ID
   * @returns Promise resolving when deletion is complete
   */
  hardDeleteTask(id: string): Promise<void>;

  /**
   * Get all tasks including soft-deleted ones
   * @returns Promise resolving to array of all tasks
   */
  getAllTasksIncludingDeleted(): Promise<Task[]>;

  /**
   * Toggle task completion status
   * @param id - Task ID
   * @returns Promise resolving to updated task
   */
  toggleTask(id: string): Promise<Task>;

  /**
   * Mark an entity as successfully synced.
   * Clears pendingSync flag and stamps lastSyncedAt.
   */
  markSynced(id: string): Promise<void>;
}
