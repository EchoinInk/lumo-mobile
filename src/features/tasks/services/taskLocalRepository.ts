import { ITaskRepository } from './taskRepository.types';
import { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';
import { StorageKeys } from '@/services/storage/storageKeys';
import { getString, setString, deleteKey } from '@/services/storage/mmkv';

/**
 * Task Local Repository
 * 
 * MMKV-backed local implementation of the task repository.
 * Handles all task data persistence with clean async API surface.
 * 
 * Responsibilities:
 * - Read/write tasks from MMKV storage
 * - Serialize/deserialize task data
 * - Generate IDs and timestamps
 * - Isolate persistence logic from UI
 */
export class TaskLocalRepository implements ITaskRepository {
  private readonly STORAGE_KEY = StorageKeys.TASKS;

  /**
   * Get all tasks from storage
   */
  async getTasks(): Promise<Task[]> {
    try {
      const data = getString(this.STORAGE_KEY);
      if (!data) {
        return [];
      }
      const tasks = JSON.parse(data) as Task[];
      return tasks;
    } catch (error) {
      console.error('Error loading tasks from storage:', error);
      return [];
    }
  }

  /**
   * Generic getAll implementation for IRepository contract
   */
  async getAll(): Promise<Task[]> {
    return this.getTasks();
  }

  /**
   * Get a task by ID
   */
  async getById(id: string): Promise<Task | null> {
    const tasks = await this.getTasks();
    return tasks.find((task) => task.id === id) || null;
  }

  /**
   * Create a new task
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    const tasks = await this.getTasks();
    
    const newTask: Task = {
      ...input,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks, newTask];
    await this.saveTasks(updatedTasks);

    return newTask;
  }

  /**
   * Generic create implementation for IRepository contract
   */
  async create(input: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    return this.createTask(input as CreateTaskInput);
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    const updatedTask: Task = {
      ...tasks[taskIndex],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    await this.saveTasks(tasks);

    return updatedTask;
  }

  /**
   * Generic update implementation for IRepository contract
   */
  async update(id: string, input: Partial<Task>): Promise<Task> {
    return this.updateTask(id, input);
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter((task) => task.id !== id);
    await this.saveTasks(filteredTasks);
  }

  /**
   * Generic delete implementation for IRepository contract
   */
  async delete(id: string): Promise<void> {
    return this.deleteTask(id);
  }

  /**
   * Toggle task completion status
   */
  async toggleTask(id: string): Promise<Task> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
      throw new Error(`Task with id ${id} not found`);
    }

    const updatedTask: Task = {
      ...tasks[taskIndex],
      completed: !tasks[taskIndex].completed,
      updatedAt: new Date().toISOString(),
    };

    tasks[taskIndex] = updatedTask;
    await this.saveTasks(tasks);

    return updatedTask;
  }

  /**
   * Save tasks to storage (private helper)
   */
  private async saveTasks(tasks: Task[]): Promise<void> {
    try {
      setString(this.STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks to storage:', error);
      throw error;
    }
  }

  /**
   * Clear all tasks from storage (useful for testing or reset)
   */
  async clearAll(): Promise<void> {
    deleteKey(this.STORAGE_KEY);
  }
}

// Export singleton instance
export const taskLocalRepository = new TaskLocalRepository();
