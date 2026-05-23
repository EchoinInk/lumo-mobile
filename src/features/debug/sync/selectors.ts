/**
 * Sync Debug Selectors
 *
 * Pure selectors for transforming sync snapshot data.
 * Used by debug screen for data presentation.
 */

import type { SyncSnapshot } from '@/services/sync/monitor/createSyncSnapshot';

// ── Health Selectors ───────────────────────────────────────────────────────

/**
 * Select health status from snapshot.
 */
export function selectHealthStatus(snapshot: SyncSnapshot): 'healthy' | 'warning' | 'critical' {
  if (!snapshot.health.isHealthy) {
    return 'critical';
  }
  if (snapshot.queue.deadLetter > 0 || snapshot.health.violations.length > 0) {
    return 'warning';
  }
  return 'healthy';
}

/**
 * Select health color for UI.
 */
export function selectHealthColor(status: 'healthy' | 'warning' | 'critical'): string {
  switch (status) {
    case 'healthy':
      return '#10b981'; // green
    case 'warning':
      return '#f59e0b'; // yellow
    case 'critical':
      return '#ef4444'; // red
  }
}

// ── Queue Selectors ───────────────────────────────────────────────────────

/**
 * Select queue summary text.
 */
export function selectQueueSummary(snapshot: SyncSnapshot): string {
  const { total, pending, failed, deadLetter } = snapshot.queue;
  return `${total} total (${pending} pending, ${failed} failed, ${deadLetter} dead letter)`;
}

/**
 * Select entity with most pending items.
 */
export function selectTopPendingEntity(snapshot: SyncSnapshot): { entity: string; count: number } | null {
  const entries = Object.entries(snapshot.queue.byEntity);
  if (entries.length === 0) return null;

  const top = entries.reduce((max, [entity, stats]) => {
    return stats.pending > max.count ? { entity, count: stats.pending } : max;
  }, { entity: '', count: 0 });

  return top.count > 0 ? top : null;
}

/**
 * Select entity with most dead letters.
 */
export function selectTopDeadLetterEntity(snapshot: SyncSnapshot): { entity: string; count: number } | null {
  const entries = Object.entries(snapshot.queue.byEntity);
  if (entries.length === 0) return null;

  const top = entries.reduce((max, [entity, stats]) => {
    return stats.deadLetter > max.count ? { entity, count: stats.deadLetter } : max;
  }, { entity: '', count: 0 });

  return top.count > 0 ? top : null;
}

// ── Retry Selectors ───────────────────────────────────────────────────────

/**
 * Select retry summary text.
 */
export function selectRetrySummary(snapshot: SyncSnapshot): string {
  const { totalRetries, avgRetriesPerItem, maxRetries } = snapshot.retries;
  return `${totalRetries} total retries (avg: ${avgRetriesPerItem.toFixed(1)}, max: ${maxRetries})`;
}

/**
 * Select items with high retry count.
 */
export function selectHighRetryItems(snapshot: SyncSnapshot, threshold: number = 3): number {
  return snapshot.queue.total - snapshot.queue.pending - snapshot.queue.failed;
}

// ── Lag Selectors ─────────────────────────────────────────────────────────

/**
 * Select lag summary text.
 */
export function selectLagSummary(snapshot: SyncSnapshot): string {
  const { syncLagMs, oldestPendingAgeMs } = snapshot.lag;
  const lagSeconds = Math.floor(syncLagMs / 1000);
  const ageSeconds = Math.floor(oldestPendingAgeMs / 1000);
  return `Sync lag: ${lagSeconds}s, Oldest pending: ${ageSeconds}s`;
}

/**
 * Select lag status.
 */
export function selectLagStatus(snapshot: SyncSnapshot): 'normal' | 'elevated' | 'high' {
  const { syncLagMs } = snapshot.lag;
  if (syncLagMs < 60000) return 'normal'; // < 1 minute
  if (syncLagMs < 300000) return 'elevated'; // < 5 minutes
  return 'high'; // >= 5 minutes
}

// ── Dead Letter Selectors ─────────────────────────────────────────────────

/**
 * Select dead letter summary text.
 */
export function selectDeadLetterSummary(snapshot: SyncSnapshot): string {
  const count = snapshot.queue.deadLetter;
  if (count === 0) return 'No dead letters';
  return `${count} dead letter${count > 1 ? 's' : ''}`;
}

/**
 * Group dead letters by error type.
 */
export function selectDeadLettersByError(snapshot: SyncSnapshot): Record<string, number> {
  return snapshot.deadLetters.reduce((acc, dl) => {
    const error = dl.error || 'unknown';
    acc[error] = (acc[error] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

// ── Connectivity Selectors ─────────────────────────────────────────────────

/**
 * Select connectivity summary text.
 */
export function selectConnectivitySummary(snapshot: SyncSnapshot): string {
  const { isConnected, isInternetReachable, type } = snapshot.connectivity;
  if (!isConnected) return 'Disconnected';
  if (isInternetReachable === false) return 'No internet';
  return `Connected (${type})`;
}

/**
 * Select connectivity status.
 */
export function selectConnectivityStatus(snapshot: SyncSnapshot): 'online' | 'offline' | 'limited' {
  const { isConnected, isInternetReachable } = snapshot.connectivity;
  if (!isConnected) return 'offline';
  if (isInternetReachable === false) return 'limited';
  return 'online';
}

// ── Processing Selectors ───────────────────────────────────────────────────

/**
 * Select processing summary text.
 */
export function selectProcessingSummary(snapshot: SyncSnapshot): string {
  const { isProcessing, lockId } = snapshot.processing;
  if (!isProcessing) return 'Idle';
  return `Processing (lock: ${lockId?.slice(-8) || 'unknown'})`;
}

/**
 * Check if processing is stuck.
 */
export function selectIsProcessingStuck(snapshot: SyncSnapshot, maxAgeMs: number = 300000): boolean {
  if (!snapshot.processing.isProcessing) return false;
  if (!snapshot.processing.lastProcessedAt) return false;
  
  const age = Date.now() - new Date(snapshot.processing.lastProcessedAt).getTime();
  return age > maxAgeMs;
}

// ── Snapshot Metadata Selectors ───────────────────────────────────────────

/**
 * Select snapshot age in seconds.
 */
export function selectSnapshotAge(snapshot: SyncSnapshot): number {
  const age = Date.now() - new Date(snapshot.timestamp).getTime();
  return Math.floor(age / 1000);
}

/**
 * Select snapshot age text.
 */
export function selectSnapshotAgeText(snapshot: SyncSnapshot): string {
  const age = selectSnapshotAge(snapshot);
  if (age < 60) return `${age}s ago`;
  if (age < 3600) return `${Math.floor(age / 60)}m ago`;
  return `${Math.floor(age / 3600)}h ago`;
}
