/**
 * Task Sync Repository
 *
 * Wraps TaskLocalRepository with sync queue integration.
 * Implements the offline-first pattern:
 *
 *   1. Update local cache instantly (optimistic)
 *   2. Enqueue sync operation
 *   3. Attempt background sync
 *
 * UI never blocks on network. Sync failures are retried automatically.
 *
 * Flow: Screen → Hook → taskSyncRepository → local + sync queue
 */

import { createOptionalRepositoryContext } from "@/services/repositories/factory";
import { hasPendingOperations } from "@/services/storage/syncQueue";
import { isOnline } from "@/services/sync/network";
import { createQueueItem } from "@/services/sync/queue/queue.factory";
import { startBackgroundSync } from "@/services/sync/queue/syncProcessor";
import type { CreateTaskInput, Task, UpdateTaskInput } from "../types/task";
import { taskLocalRepository } from "./taskLocalRepository";
import type { ITaskRepository } from "./taskRepository.types";

class TaskSyncRepository implements ITaskRepository {
  /**
   * Get all tasks — reads from local cache only.
   * Network fetch is handled by background sync.
   */
  async getTasks(): Promise<Task[]> {
    return taskLocalRepository.getTasks();
  }

  async getAll(): Promise<Task[]> {
    return taskLocalRepository.getAll();
  }

  async getById(id: string): Promise<Task | null> {
    return taskLocalRepository.getById(id);
  }

  /**
   * Create a task optimistically.
   * Updates local storage immediately, then enqueues sync.
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    // 1. Update local cache instantly
    const task = await taskLocalRepository.createTask(input);

    // 2. Resolve user ownership (tolerates anonymous mode)
    const { userId } = await createOptionalRepositoryContext();

    // 3. Enqueue sync operation stamped with owner
    // TODO: Phase 13.2 - Update to use new RepositoryContext with ownership metadata
    createQueueItem({
      ownerType: userId ? "authenticated" : "guest",
      localOwnerId: userId || "guest", // Fallback for guest mode
      cloudOwnerId: userId || undefined,
      syncPartitionKey: userId ? `user:${userId}:syncQueue` : "guest:syncQueue",
      entity: "task",
      operation: "create",
      entityId: task.id,
      payload: task as unknown as Record<string, unknown>,
    });

    // 4. Attempt background sync (non-blocking)
    this.triggerSync();

    return task;
  }

  async create(
    input: Omit<
      Task,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "version"
      | "lastSyncedAt"
      | "pendingSync"
    >,
  ): Promise<Task> {
    return this.createTask(input as CreateTaskInput);
  }

  /**
   * Update a task optimistically.
   */
  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    // 1. Update local cache instantly
    const task = await taskLocalRepository.updateTask(id, input);

    // 2. Resolve user ownership (tolerates anonymous mode)
    const { userId } = await createOptionalRepositoryContext();

    // 3. Enqueue sync operation stamped with owner
    // TODO: Phase 13.2 - Update to use new RepositoryContext with ownership metadata
    createQueueItem({
      ownerType: userId ? "authenticated" : "guest",
      localOwnerId: userId || "guest",
      cloudOwnerId: userId || undefined,
      syncPartitionKey: userId ? `user:${userId}:syncQueue` : "guest:syncQueue",
      entity: "task",
      operation: "update",
      entityId: id,
      payload: input as unknown as Record<string, unknown>,
    });

    // 4. Attempt background sync (non-blocking)
    this.triggerSync();

    return task;
  }

  async update(id: string, input: Partial<Task>): Promise<Task> {
    return this.updateTask(id, input);
  }

  /**
   * Soft delete a task optimistically.
   */
  async deleteTask(id: string): Promise<void> {
    // 1. Update local cache instantly (soft delete)
    await taskLocalRepository.deleteTask(id);

    // 2. Resolve user ownership (tolerates anonymous mode)
    const { userId } = await createOptionalRepositoryContext();

    // 3. Enqueue sync operation stamped with owner
    createQueueItem({
      userId,
      entity: "task",
      operation: "delete",
      entityId: id,
      payload: { id },
    });

    // 4. Attempt background sync (non-blocking)
    this.triggerSync();
  }

  async delete(id: string): Promise<void> {
    return this.deleteTask(id);
  }

  /**
   * Hard delete a task (removes from storage).
   * Use with caution - intended for admin/purge operations.
   */
  async hardDeleteTask(id: string): Promise<void> {
    return taskLocalRepository.hardDeleteTask(id);
  }

  /**
   * Get all tasks including soft-deleted ones.
   */
  async getAllTasksIncludingDeleted(): Promise<Task[]> {
    return taskLocalRepository.getAllTasksIncludingDeleted();
  }

  /**
   * Toggle task completion optimistically.
   */
  async toggleTask(id: string): Promise<Task> {
    // 1. Update local cache instantly
    const task = await taskLocalRepository.toggleTask(id);

    // 2. Resolve user ownership (tolerates anonymous mode)
    const { userId } = await createOptionalRepositoryContext();

    // 3. Enqueue sync operation stamped with owner
    createQueueItem({
      userId,
      entity: "task",
      operation: "update",
      entityId: id,
      payload: { completed: task.completed },
    });

    // 4. Attempt background sync (non-blocking)
    this.triggerSync();

    return task;
  }

  /**
   * Mark a task as successfully synced.
   * Delegates to local repo to clear pendingSync and stamp lastSyncedAt.
   */
  async markSynced(id: string): Promise<void> {
    return taskLocalRepository.markSynced(id);
  }

  /**
   * Check if there are unsynced task operations.
   */
  hasPendingSync(): boolean {
    return hasPendingOperations();
  }

  /**
   * Trigger background sync attempt (non-blocking).
   * Only fires if online. Failures are silently queued.
   */
  private triggerSync(): void {
    if (!isOnline()) return;

    startBackgroundSync();
  }
}

export const taskSyncRepository = new TaskSyncRepository();
