/**
 * API Response Types
 *
 * Shared types for all API service responses.
 * Keeps API boundaries consistent across the app.
 */

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasMore: boolean;
}

/**
 * Base entity shape for all Supabase-backed records.
 * Maps to standard Supabase row conventions.
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Maps Supabase snake_case to app camelCase.
 * Use when transforming API responses to domain models.
 */
export type CamelCase<T extends string> =
  T extends `${infer A}_${infer B}`
    ? `${A}${Capitalize<CamelCase<B>>}`
    : T;
