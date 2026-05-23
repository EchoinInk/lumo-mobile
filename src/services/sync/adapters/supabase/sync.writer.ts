/**
 * Supabase Sync Writer — Task Domain
 *
 * Maps task sync events to Supabase table operations.
 * Idempotent-safe writes for conflict resolution.
 *
 * Table assumed: `tasks`
 *   - id: string (primary key, matches local entity id)
 *   - title: string
 *   - description: string | null
 *   - priority: 'low' | 'medium' | 'high'
 *   - completed: boolean
 *   - due_date: string | null (ISO timestamp)
 *   - deleted_at: string | null (ISO timestamp, soft delete marker)
 *   - created_at: string (ISO timestamp)
 *   - updated_at: string (ISO timestamp)
 *
 * Responsibility:
 * - Map SyncEvent to Supabase query
 * - Handle upsert for idempotency
 * - No business logic
 * - No retry logic (handled by caller)
 */

import type { SyncEvent } from '../syncEvent.types';
import { supabase } from './supabase.client';

/**
 * Write a task sync event to Supabase.
 *
 * @param event - Task sync event
 * @throws Error if Supabase write fails
 */
export async function writeTaskToSupabase(event: SyncEvent): Promise<void> {
  if (!supabase) {
    throw new Error('[TaskWriter] Supabase client not initialized');
  }

  const { operation, entityId, payload } = event;

  switch (operation) {
    case 'create':
      await createTask(entityId, payload);
      break;

    case 'update':
      await updateTask(entityId, payload);
      break;

    case 'delete':
      await deleteTask(entityId, payload);
      break;

    default:
      throw new Error(`[TaskWriter] Unknown operation: ${operation}`);
  }
}

// ── Individual Operations ───────────────────────────────────────────────────

async function createTask(
  entityId: string,
  payload: unknown
): Promise<void> {
  const data = payload as {
    title: string;
    priority?: 'low' | 'medium' | 'high';
    description?: string;
    dueDate?: string;
  };

  const now = new Date().toISOString();

  const { error } = await supabase!.from('tasks').upsert(
    {
      id: entityId,
      title: data.title,
      description: data.description ?? null,
      priority: data.priority ?? 'medium',
      completed: false,
      due_date: data.dueDate ?? null,
      deleted_at: null,
      created_at: now,
      updated_at: now,
    },
    {
      onConflict: 'id', // Upsert for idempotency
    }
  );

  if (error) {
    throw new Error(`[TaskWriter] Create failed: ${error.message}`);
  }
}

async function updateTask(
  entityId: string,
  payload: unknown
): Promise<void> {
  const data = payload as {
    title?: string;
    priority?: 'low' | 'medium' | 'high';
    description?: string;
    dueDate?: string;
    completed?: boolean;
  };

  const now = new Date().toISOString();

  // Build update object dynamically
  const updateData: Record<string, unknown> = {
    updated_at: now,
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
  if (data.completed !== undefined) updateData.completed = data.completed;

  const { error } = await supabase!
    .from('tasks')
    .update(updateData)
    .eq('id', entityId);

  if (error) {
    throw new Error(`[TaskWriter] Update failed: ${error.message}`);
  }
}

async function deleteTask(
  entityId: string,
  payload: unknown
): Promise<void> {
  const data = payload as { deletedAt?: string };

  // Soft delete: mark deleted_at timestamp
  const deletedAt = data.deletedAt ?? new Date().toISOString();

  const { error } = await supabase!.from('tasks').upsert(
    {
      id: entityId,
      deleted_at: deletedAt,
      updated_at: deletedAt,
    },
    {
      onConflict: 'id',
    }
  );

  if (error) {
    throw new Error(`[TaskWriter] Delete failed: ${error.message}`);
  }
}
