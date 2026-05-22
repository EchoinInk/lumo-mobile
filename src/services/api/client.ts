/**
 * API Client
 *
 * Thin fetch wrapper that provides a consistent HTTP interface.
 * No Supabase dependency — connects to any REST backend.
 *
 * All methods return ApiResponse<T> so callers never deal
 * with raw exceptions; errors are always typed.
 *
 * Usage:
 *   const { data, error } = await apiClient.get<Task[]>('/tasks');
 *
 * Future: add auth token injection once auth is wired up.
 */

import type { ApiError, ApiResponse } from '@/types/api';

/**
 * Base URL for all API requests.
 * Reads from env; safe to leave blank during local-first phase.
 */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

/**
 * Default headers sent with every request.
 */
const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

/**
 * Build a typed ApiError from a fetch Response.
 */
async function responseToError(response: Response): Promise<ApiError> {
  let message = `HTTP ${response.status}: ${response.statusText}`;
  try {
    const body = await response.json();
    if (typeof body?.message === 'string') message = body.message;
  } catch {
    // body was not JSON — use status text
  }
  return { message, status: response.status };
}

/**
 * Core fetch helper — shared by all HTTP methods.
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { ...DEFAULT_HEADERS, ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await responseToError(response);
      return { data: null, error };
    }

    // 204 No Content — successful but no body
    if (response.status === 204) {
      return { data: null, error: null };
    }

    const data = (await response.json()) as T;
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown network error';
    return { data: null, error: { message } };
  }
}

/**
 * API Client — public interface.
 */
export const apiClient = {
  /**
   * HTTP GET
   * @param path - URL path relative to BASE_URL
   */
  get<T>(path: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return request<T>('GET', path, undefined, headers);
  },

  /**
   * HTTP POST
   * @param path - URL path relative to BASE_URL
   * @param body - Request body (will be JSON-serialised)
   */
  post<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return request<T>('POST', path, body, headers);
  },

  /**
   * HTTP PUT
   * @param path - URL path relative to BASE_URL
   * @param body - Request body (will be JSON-serialised)
   */
  put<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return request<T>('PUT', path, body, headers);
  },

  /**
   * HTTP PATCH
   * @param path - URL path relative to BASE_URL
   * @param body - Partial request body (will be JSON-serialised)
   */
  patch<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return request<T>('PATCH', path, body, headers);
  },

  /**
   * HTTP DELETE
   * @param path - URL path relative to BASE_URL
   */
  delete<T = void>(path: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return request<T>('DELETE', path, undefined, headers);
  },
} as const;
