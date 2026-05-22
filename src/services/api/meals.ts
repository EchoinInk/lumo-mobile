/**
 * Meals API
 *
 * Stub layer for future remote meal tracking endpoints.
 * All methods are no-ops / empty stubs so the repository
 * pattern can reference this module without a live backend.
 *
 * When a backend is introduced, replace stub bodies here.
 * The repository contract stays unchanged — the UI never
 * imports from this file directly.
 *
 * Flow: UI → useMeals hook → mealRepository → mealsApi (this file)
 */

import type { ApiResponse } from '@/types/api';
import type { Meal } from '@/store/useMealStore';

export interface CreateMealInput {
  name: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType: Meal['mealType'];
  date: string;
}

export interface UpdateMealInput {
  name?: string;
  description?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  mealType?: Meal['mealType'];
  date?: string;
}

/**
 * Meals API — stub implementations.
 */
export const mealsApi = {
  /**
   * Fetch all meals for the authenticated user.
   * @stub Returns empty array until backend is connected.
   */
  async getAll(): Promise<ApiResponse<Meal[]>> {
    // TODO: GET /meals
    return { data: [], error: null };
  },

  /**
   * Fetch meals for a specific date.
   * @stub Returns empty array until backend is connected.
   */
  async getByDate(_date: string): Promise<ApiResponse<Meal[]>> {
    // TODO: GET /meals?date=:date
    return { data: [], error: null };
  },

  /**
   * Fetch a single meal by ID.
   * @stub Returns null until backend is connected.
   */
  async getById(_id: string): Promise<ApiResponse<Meal>> {
    // TODO: GET /meals/:id
    return { data: null, error: null };
  },

  /**
   * Create a new meal on the remote backend.
   * @stub Returns null until backend is connected.
   */
  async create(_input: CreateMealInput): Promise<ApiResponse<Meal>> {
    // TODO: POST /meals
    return { data: null, error: null };
  },

  /**
   * Update an existing meal on the remote backend.
   * @stub Returns null until backend is connected.
   */
  async update(_id: string, _input: UpdateMealInput): Promise<ApiResponse<Meal>> {
    // TODO: PATCH /meals/:id
    return { data: null, error: null };
  },

  /**
   * Delete a meal from the remote backend.
   * @stub No-op until backend is connected.
   */
  async delete(_id: string): Promise<ApiResponse<void>> {
    // TODO: DELETE /meals/:id
    return { data: null, error: null };
  },
} as const;
