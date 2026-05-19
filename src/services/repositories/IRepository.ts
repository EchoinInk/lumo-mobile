/**
 * Generic Repository Interface
 * 
 * Defines the standard contract for all repositories in the application.
 * This provides a consistent API for data operations across different
 * storage backends (local MMKV, Supabase, Firebase, etc.).
 * 
 * @template T - The entity type this repository manages
 */
export interface IRepository<T> {
  /**
   * Get all entities
   * @returns Promise resolving to array of all entities
   */
  getAll(): Promise<T[]>;

  /**
   * Get an entity by ID
   * @param id - Entity ID
   * @returns Promise resolving to entity or null if not found
   */
  getById(id: string): Promise<T | null>;

  /**
   * Create a new entity
   * @param input - Entity data without system-generated fields
   * @returns Promise resolving to created entity
   */
  create(input: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * Update an existing entity
   * @param id - Entity ID
   * @param input - Partial entity data to update
   * @returns Promise resolving to updated entity
   */
  update(id: string, input: Partial<T>): Promise<T>;

  /**
   * Delete an entity
   * @param id - Entity ID
   * @returns Promise resolving when deletion is complete
   */
  delete(id: string): Promise<void>;
}
