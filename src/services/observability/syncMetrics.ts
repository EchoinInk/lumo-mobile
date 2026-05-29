import { analytics } from "./analytics";
import { logger } from "./logger";
import { performanceMetrics } from "./performanceMetrics";
import type { ObservabilityTransport, SyncMetric } from "./types";

const metrics: SyncMetric[] = [];
const transports = new Set<ObservabilityTransport>();
const MAX_SYNC_BUFFER = 200;

function remember(metric: SyncMetric): void {
  metrics.push(metric);
  if (metrics.length > MAX_SYNC_BUFFER) {
    metrics.shift();
  }
}

function sendToTransports(metric: SyncMetric): void {
  transports.forEach((transport) => {
    try {
      transport.sync?.(metric);
    } catch (error) {
      logger.warn("[Observability] Sync transport failed", undefined, error);
    }
  });
}

function recordSyncMetric(
  operation: string,
  duration: number,
  success: boolean,
  properties?: Record<string, unknown>,
): SyncMetric {
  const metric = { operation, duration, success };
  remember(metric);
  sendToTransports(metric);
  performanceMetrics.recordMetric(`sync.${operation}.duration`, duration);
  analytics.track(success ? "sync_operation_succeeded" : "sync_operation_failed", {
    operation,
    duration,
    ...properties,
  });
  return metric;
}

export const syncMetrics = {
  recordSyncSuccess: (
    operation: string,
    duration = 0,
    properties?: Record<string, unknown>,
  ) => recordSyncMetric(operation, duration, true, properties),
  recordSyncFailure: (
    operation: string,
    duration = 0,
    properties?: Record<string, unknown>,
  ) => recordSyncMetric(operation, duration, false, properties),
  recordQueueReplay: (count = 1, properties?: Record<string, unknown>) =>
    analytics.track("sync_queue_replay", { count, ...properties }),
  recordQueueFailure: (count = 1, properties?: Record<string, unknown>) =>
    analytics.track("sync_queue_failure", { count, ...properties }),
  recordQueueRecovery: (count = 1, properties?: Record<string, unknown>) =>
    analytics.track("sync_queue_recovery", { count, ...properties }),
  recordConflictResolution: (
    count = 1,
    properties?: Record<string, unknown>,
  ) => analytics.track("sync_conflict_resolution", { count, ...properties }),
  addTransport: (transport: ObservabilityTransport) => {
    transports.add(transport);
    return () => transports.delete(transport);
  },
  getBufferedMetrics: () => [...metrics],
  clearBufferedMetrics: () => {
    metrics.length = 0;
  },
};
