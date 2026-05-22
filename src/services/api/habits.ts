/**
 * Habits API
 *
 * Stub layer for future remote habit endpoints.
 * All methods are no-ops / empty stubs so the repository
 * pattern can reference this module without a live backend.
 *
 * When a backend is introduced, replace stub bodies here.
 * The repository contract stays unchanged — the UI never
 * imports from this file directly.
 *
 * Flow: UI → useHabits hook → habitRepository → habitsApi (this file)
 */

import type { ApiResponse } from '@/types/api';
import type { Habit } from '@/store/useHabitStore';

export interface CreateHabitInput {
  title: string;
  description?: string;
  frequency: Habit['frequency'];
  targetDays: number[];
  color?: string;
  icon?: string;
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  frequency?: Habit['frequency'];
  targetDays?: number[];
  color?: string;
  icon?: string;
}

/**
 * Habits API — stub implementations.
 */
export const habitsApi = {
  /**
   * Fetch all habits for the authenticated user.
   * @stub Returns empty array until backend is connected.
   */
  async getAll(): Promise<ApiResponse<Habit[]>> {
    // TODO: GET /habits
    return { data: [], error: null };
  },

  /**
   * Fetch a single habit by ID.
   * @stub Returns null until backend is connected.
   */
  async getById(_id: string): Promise<ApiResponse<Habit>> {
    // TODO: GET /habits/:id
    return { data: null, error: null };
  },

  /**
   * Create a new habit on the remote backend.
   * @stub Returns null until backend is connected.
   */
  async create(_input: CreateHabitInput): Promise<ApiResponse<Habit>> {
    // TODO: POST /habits
    return { data: null, error: null };
  },

  /**
   * Update an existing habit on the remote backend.
   * @stub Returns null until backend is connected.
   */
  async update(_id: string, _input: UpdateHabitInput): Promise<ApiResponse<Habit>> {
    // TODO: PATCH /habits/:id
    return { data: null, error: null };
  },

  /**
   * Delete a habit from the remote backend.
   * @stub No-op until backend is connected.
   */
  async delete(_id: string): Promise<ApiResponse<void>> {
    // TODO: DELETE /habits/:id
    return { data: null, error: null };
  },

  /**
   * Record a completion for a specific date.
   * @stub Returns null until backend is connected.
   */
  async toggleCompletion(_id: string, _date: string): Promise<ApiResponse<Habit>> {
    // TODO: PATCH /habits/:id/complete
    return { data: null, error: null };
  },
} as const;
