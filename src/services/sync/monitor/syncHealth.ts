/**
 * Sync Health Monitor
 *
 * Tracks sync system health metrics for debugging and observability.
 *
 * Responsibilities:
 * - Queue size tracking
 * - Failed event count
 * - Last sync timestamp
 * - Sync lag estimation
 *
 * Architecture:
 *   Queue/Processor → Health Monitor → Debug Info
 *
 * NOTE: For debugging only — no UI integration yet.
 */

import { getQueueItems, getPendingItems } from '../../storage/syncQueue';
import type { SyncQueueItem } from '../../storage/queue.types';
import { getProcessedEventCount } from '../queue/queue.dedup';
import {
  getDeadLetterCount,
  getPendingSyncCount,
  isSyncQueueProcessing,
} from '../queue/syncProcessor';
import { isSupabaseConfigured } from '../supabase/supabase.client';

// ── Types ────────────────────────────────────────────────────────────────────

export interface SyncHealth {
  /** Overall health status */
  status: 'healthy' | 'degraded' | 'unhealthy' | 'offline';

  /** Queue metrics */
  queue: {
    total: number;
    pending: number;
    failed: number;
    deadLetter: number;
    oldestPendingAgeMs: number | null;
  };

  /** Sync progress metrics */
  sync: {
    isProcessing: boolean;
    isSupabaseConfigured: boolean;
    lastSyncAt: string | null;
    estimatedLagMs: number | null;
  };

  /** Deduplication metrics */
  dedup: {
    processedEventsTracked: number;
  };

  /** Per-entity breakdown (for debugging) */
  byEntity: Record<string, {
    pending: number;
    failed: number;
  }>;

  /** Human-readable summary */
  summary: string;
}

// ── Private: Storage ───────────────────────────────────────────────────────

const LAST_SYNC_KEY = 'sync_health_last_sync_at';

function getLastSyncAt(): string | null {
  try {
    // Use a simple approach — last time any sync completed
    const items = getQueueItems();
    // Find the most recent timestamp in processed events (this is a proxy)
    // In a real implementation, we'd track this explicitly
    return null; // Simplified for now
  } catch {
    return null;
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Get comprehensive sync health status.
 *
 * @returns SyncHealth object with all metrics
 */
export function getSyncHealth(): SyncHealth {
  const allItems = getQueueItems();
  const pendingItems = getPendingItems();
  const isProcessing = isSyncQueueProcessing();
  const isConfigured = isSupabaseConfigured();
  const deadLetter = getDeadLetterCount();
  const processedEvents = getProcessedEventCount();

  // Calculate oldest pending age
  let oldestPendingAgeMs: number | null = null;
  if (pendingItems.length > 0) {
    const now = Date.now();
    const oldest = pendingItems.reduce((oldest, item) => {
      const itemTime = new Date(item.timestamp).getTime();
      return itemTime < oldest ? itemTime : oldest;
    }, now);
    oldestPendingAgeMs = now - oldest;
  }

  // Calculate per-entity breakdown
  const byEntity: Record<string, { pending: number; failed: number }> = {};
  for (const item of allItems) {
    if (!byEntity[item.entity]) {
      byEntity[item.entity] = { pending: 0, failed: 0 };
    }
    if (item.status === 'pending') {
      byEntity[item.entity].pending++;
    } else if (item.status === 'failed') {
      byEntity[item.entity].failed++;
    }
  }

  // Determine health status
  let status: SyncHealth['status'];
  if (!isConfigured) {
    status = 'offline';
  } else if (deadLetter > 10) {
    status = 'unhealthy';
  } else if (deadLetter > 0 || pendingItems.length > 50) {
    status = 'degraded';
  } else {
    status = 'healthy';
  }

  // Build summary
  const summaryParts: string[] = [];
  summaryParts.push(`Status: ${status}`);
  summaryParts.push(`Queue: ${pendingItems.length} pending, ${deadLetter} dead-letter`);
  summaryParts.push(`Processing: ${isProcessing ? 'active' : 'idle'}`);
  if (oldestPendingAgeMs !== null) {
    const minutes = Math.floor(oldestPendingAgeMs / 60000);
    summaryParts.push(`Lag: ${minutes}m`);
  }

  return {
    status,
    queue: {
      total: allItems.length,
      pending: pendingItems.length,
      failed: allItems.filter((i) => i.status === 'failed').length,
      deadLetter,
      oldestPendingAgeMs,
    },
    sync: {
      isProcessing,
      isSupabaseConfigured: isConfigured,
      lastSyncAt: getLastSyncAt(),
      estimatedLagMs: oldestPendingAgeMs,
    },
    dedup: {
      processedEventsTracked: processedEvents,
    },
    byEntity,
    summary: summaryParts.join(' | '),
  };
}

/**
 * Log sync health to console for debugging.
 */
export function logSyncHealth(): void {
  const health = getSyncHealth();

  console.log('[SyncHealth] ──────────────────────────');
  console.log(`Status: ${health.status}`);
  console.log(`Queue: ${health.queue.pending} pending, ${health.queue.deadLetter} dead-letter, ${health.queue.total} total`);
  console.log(`Processing: ${health.sync.isProcessing ? 'ACTIVE' : 'idle'}`);
  console.log(`Supabase: ${health.sync.isSupabaseConfigured ? 'configured' : 'NOT CONFIGURED'}`);
  console.log(`Dedup tracked: ${health.dedup.processedEventsTracked} events`);

  if (Object.keys(health.byEntity).length > 0) {
    console.log('By entity:');
    for (const [entity, counts] of Object.entries(health.byEntity)) {
      console.log(`  ${entity}: ${counts.pending} pending, ${counts.failed} failed`);
    }
  }

  console.log(`Summary: ${health.summary}`);
  console.log('[SyncHealth] ──────────────────────────');
}

/**
 * Quick health check — returns true if sync is healthy.
 */
export function isSyncHealthy(): boolean {
  const health = getSyncHealth();
  return health.status === 'healthy';
}

/**
 * Check if there are dead-letter items that need attention.
 */
export function hasDeadLetterItems(): boolean {
  return getDeadLetterCount() > 0;
}

/**
 * Get estimated sync lag in minutes.
 */
export function getSyncLagMinutes(): number | null {
  const health = getSyncHealth();
  if (health.queue.oldestPendingAgeMs === null) return null;
  return Math.floor(health.queue.oldestPendingAgeMs / 60000);
}
