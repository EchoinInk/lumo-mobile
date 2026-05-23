/**
 * Supabase Sync Adapter
 *
 * SINGLE entry point for all Supabase sync operations.
 * Routes events by type only — no business logic.
 *
 * Architecture:
 *   Queue → Sync Processor → supabaseSyncAdapter(event) → Domain Writer → Supabase
 *
 * Responsibility:
 * - Route events to appropriate domain writer
 * - Handle "not configured" gracefully
 * - No transformation logic
 * - No retry logic (handled by caller)
 *
 * ONLY infrastructure routing.
 */

import type { SyncEvent } from '../syncEvent.types';
import { isSupabaseConfigured } from './supabase.client';
import { writeTaskToSupabase } from './sync.writer';

/**
 * Process a sync event through the Supabase adapter.
 *
 * SINGLE CANONICAL entry point for all Supabase sync operations.
 *
 * @param event - The sync event to process
 * @throws Error if Supabase is not configured or write fails
 *
 * @example
 * await supabaseSyncAdapter({
 *   entity: 'task',
 *   operation: 'create',
 *   entityId: 'task-123',
 *   payload: { title: 'My Task' }
 * });
 */
export async function supabaseSyncAdapter(event: SyncEvent): Promise<void> {
  // Graceful degradation if Supabase is not configured
  if (!isSupabaseConfigured()) {
    console.warn('[SupabaseAdapter] Supabase not configured, skipping sync');
    throw new Error('Supabase not configured');
  }

  // Route by entity type only
  switch (event.entity) {
    case 'task':
      await writeTaskToSupabase(event);
      break;

    // Future entity types — DO NOT IMPLEMENT YET
    // case 'habit':
    //   await writeHabitToSupabase(event);
    //   break;
    // case 'meal':
    //   await writeMealToSupabase(event);
    //   break;
    // case 'budget':
    //   await writeBudgetToSupabase(event);
    //   break;
    // case 'workout':
    //   await writeWorkoutToSupabase(event);
    //   break;

    default:
      // Exhaustive check — should not happen with proper types
      throw new Error(`[SupabaseAdapter] Unknown entity type: ${event.entity}`);
  }
}
