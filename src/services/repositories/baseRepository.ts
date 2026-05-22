/**
 * Base Repository
 *
 * Abstract generic class that satisfies the IRepository<T> contract.
 * Concrete repositories extend this class and override only the
 * methods relevant to their domain.
 *
 * Why an abstract class over a pure interface?
 * - Provides default "not-implemented" guard implementations
 * - Allows shared utility methods (ID generation, timestamp helpers)
 * - Makes it impossible to accidentally instantiate the base directly
 *
 * Architecture:
 *   BaseRepository<T>  ←  extended by  →  TaskLocalRepository
 *                                      →  (future) HabitLocalRepository
 *                                      →  (future) MealLocalRepository
 *
 * Usage:
 *   class TaskLocalRepository extends BaseRepository<Task> {
 *     async getAll(): Promise<Task[]> { ... }
 *   }
 */

import type { IRepository } from './IRepository';

export abstract class BaseRepository<T> implements IRepository<T> {
  // ── IRepository contract ────────────────────────────────────────────────

  /**
   * Retrieve all entities.
   * Must be overridden by concrete implementations.
   */
  abstract getAll(): Promise<T[]>;

  /**
   * Retrieve a single entity by primary key.
   * Must be overridden by concrete implementations.
   */
  abstract getById(id: string): Promise<T | null>;

  /**
   * Persist a new entity.
   * Must be overridden by concrete implementations.
   */
  abstract create(
    input: Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'lastSyncedAt' | 'pendingSync'>
  ): Promise<T>;

  /**
   * Apply a partial update to an existing entity.
   * Must be overridden by concrete implementations.
   */
  abstract update(id: string, input: Partial<T>): Promise<T>;

  /**
   * Remove an entity by primary key.
   * Must be overridden by concrete implementations.
   */
  abstract delete(id: string): Promise<void>;

  // ── Shared utilities ────────────────────────────────────────────────────

  /**
   * Generate a collision-resistant unique identifier.
   * Uses crypto.randomUUID() when available, falling back to
   * a timestamp + random suffix for older environments.
   */
  protected generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Return the current time as an ISO 8601 string.
   * Centralised here so timestamps are always consistent.
   */
  protected now(): string {
    return new Date().toISOString();
  }

  /**
   * Safely parse a JSON string, returning a fallback value on failure.
   * Useful in storage-backed repositories.
   */
  protected parseJson<R>(raw: string | undefined | null, fallback: R): R {
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as R;
    } catch {
      return fallback;
    }
  }
}
