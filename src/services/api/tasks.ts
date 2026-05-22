/**
 * Tasks API
 *
 * Stub layer for future remote task endpoints.
 * All methods are no-ops / empty stubs so the repository
 * pattern can reference this module without a live backend.
 *
 * When a backend is introduced, replace stub bodies here.
 * The repository contract stays unchanged — the UI never
 * imports from this file directly.
 *
 * Flow: UI → useTasks hook → taskRepository → tasksApi (this file)
 */

import type { ApiResponse } from '@/types/api';
import type {
  CreateTaskInput,
  Task,
  UpdateTaskInput,
} from '@/features/tasks/types/task';

/**
 * Tasks API — stub implementations.
 */
export const tasksApi = {
  /**
   * Fetch all tasks for the authenticated user.
   * @stub Returns empty array until backend is connected.
   */
  async getAll(): Promise<ApiResponse<Task[]>> {
    // TODO: GET /tasks
    return { data: [], error: null };
  },

  /**
   * Fetch a single task by ID.
   * @stub Returns null until backend is connected.
   */
  async getById(_id: string): Promise<ApiResponse<Task>> {
    // TODO: GET /tasks/:id
    return { data: null, error: null };
  },

  /**
   * Create a new task on the remote backend.
   * @stub Returns null until backend is connected.
   */
  async create(_input: CreateTaskInput): Promise<ApiResponse<Task>> {
    // TODO: POST /tasks
    return { data: null, error: null };
  },

  /**
   * Update an existing task on the remote backend.
   * @stub Returns null until backend is connected.
   */
  async update(_id: string, _input: UpdateTaskInput): Promise<ApiResponse<Task>> {
    // TODO: PATCH /tasks/:id
    return { data: null, error: null };
  },

  /**
   * Delete a task from the remote backend.
   * @stub No-op until backend is connected.
   */
  async delete(_id: string): Promise<ApiResponse<void>> {
    // TODO: DELETE /tasks/:id
    return { data: null, error: null };
  },

  /**
   * Toggle task completion status on the remote backend.
   * @stub Returns null until backend is connected.
   */
  async toggle(_id: string): Promise<ApiResponse<Task>> {
    // TODO: PATCH /tasks/:id/toggle
    return { data: null, error: null };
  },
} as const;
