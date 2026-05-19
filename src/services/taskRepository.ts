import { Task } from '@/store/useTaskStore';

/**
 * Task Repository
 * 
 * Abstracts task data operations and storage.
 * This provides a clean separation between UI components and data storage.
 * 
 * Future: Can be extended to include backend API calls while maintaining
 * the same interface for UI components.
 */
export class TaskRepository {
  /**
   * Get all tasks
   * @returns Promise resolving to array of tasks
   */
  async getAll(): Promise<Task[]> {
    // Future: Fetch from backend API
    // Current: Return from store or local storage
    return [];
  }

  /**
   * Get a task by ID
   * @param id - Task ID
   * @returns Promise resolving to task or null if not found
   */
  async getById(id: string): Promise<Task | null> {
    // Future: Fetch from backend API
    return null;
  }

  /**
   * Create a new task
   * @param task - Task data without id, createdAt, updatedAt
   * @returns Promise resolving to created task
   */
  async create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    // Future: POST to backend API
    // Current: Create locally with generated ID
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newTask;
  }

  /**
   * Update an existing task
   * @param id - Task ID
   * @param updates - Partial task data to update
   * @returns Promise resolving to updated task
   */
  async update(id: string, updates: Partial<Task>): Promise<Task> {
    // Future: PUT/PATCH to backend API
    // Current: Update locally
    return {} as Task;
  }

  /**
   * Delete a task
   * @param id - Task ID
   * @returns Promise resolving to boolean indicating success
   */
  async delete(id: string): Promise<boolean> {
    // Future: DELETE to backend API
    // Current: Delete locally
    return true;
  }

  /**
   * Search tasks by query
   * @param query - Search query string
   * @returns Promise resolving to array of matching tasks
   */
  async search(query: string): Promise<Task[]> {
    // Future: Implement search on backend
    return [];
  }

  /**
   * Filter tasks by criteria
   * @param filters - Filter criteria
   * @returns Promise resolving to array of filtered tasks
   */
  async filter(filters: {
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
  }): Promise<Task[]> {
    // Future: Implement filtering on backend
    return [];
  }
}

// Export singleton instance
export const taskRepository = new TaskRepository();
