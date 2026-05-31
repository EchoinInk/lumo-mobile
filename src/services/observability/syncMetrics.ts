import { analytics } from "./analytics";
import { logger } from "./logger";
import { performanceMetrics } from "./performanceMetrics";
import type {
  ObservabilityConfig,
  ObservabilityTransport,
  SyncMetric,
} from "./types";

const metrics: SyncMetric[] = [];
const transports = new Set<ObservabilityTransport>();
const MAX_SYNC_BUFFER = 200;
const config: ObservabilityConfig = {
  enabled: true,
  debugMode: typeof __DEV__ !== "undefined" && __DEV__,
};

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
      logger.error("[Observability] Sync transport failed", error);
    }
  });
}

function normalizeErrorMessage(error?: unknown): string | undefined {
  if (!error) {
    return undefined;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function recordSyncMetric(
  operation: string,
  success: boolean,
  metadata?: Record<string, unknown>,
  error?: unknown,
): SyncMetric {
  if (!config.enabled) {
    return {
      operation,
      success,
      timestamp: Date.now(),
    };
  }

  const metric: SyncMetric = {
    operation,
    duration:
      typeof metadata?.duration === "number" ? metadata.duration : undefined,
    success,
    queueSize:
      typeof metadata?.queueSize === "number" ? metadata.queueSize : undefined,
    errorMessage: normalizeErrorMessage(error),
    timestamp: Date.now(),
    metadata,
  };

  remember(metric);
  sendToTransports(metric);
  if (typeof metric.duration === "number") {
    performanceMetrics.recordMetric(
      `sync.${operation}.duration`,
      metric.duration,
      metadata,
    );
  }
  analytics.track(success ? "sync_operation_succeeded" : "sync_operation_failed", {
    operation,
    duration: metric.duration,
    queueSize: metric.queueSize,
    errorMessage: metric.errorMessage,
    ...metadata,
  });
  return metric;
}

export const syncMetrics = {
  recordSyncSuccess: (
    operation: string,
    metadata?: Record<string, unknown> | number,
    legacyMetadata?: Record<string, unknown>,
  ) =>
    recordSyncMetric(
      operation,
      true,
      typeof metadata === "number"
        ? { ...legacyMetadata, duration: metadata }
        : metadata,
    ),
  recordSyncFailure: (
    operation: string,
    errorOrDuration?: unknown,
    metadata?: Record<string, unknown>,
  ) =>
    recordSyncMetric(
      operation,
      false,
      typeof errorOrDuration === "number"
        ? { ...metadata, duration: errorOrDuration }
        : metadata,
      typeof errorOrDuration === "number" ? undefined : errorOrDuration,
    ),
  recordQueueReplay: (count = 1, metadata?: Record<string, unknown>) => {
    if (!config.enabled) {
      return;
    }
    analytics.track("sync_queue_replay", { count, ...metadata });
  },
  recordQueueFailure: (count = 1, metadata?: Record<string, unknown>) => {
    if (!config.enabled) {
      return;
    }
    analytics.track("sync_queue_failure", { count, ...metadata });
  },
  recordQueueRecovery: (
    metadataOrCount?: Record<string, unknown> | number,
    legacyMetadata?: Record<string, unknown>,
  ) => {
    if (!config.enabled) {
      return;
    }

    const metadata =
      typeof metadataOrCount === "number"
        ? { count: metadataOrCount, ...legacyMetadata }
        : metadataOrCount;
    analytics.track("sync_queue_recovery", metadata);
  },
  recordConflictResolution: (metadata?: Record<string, unknown>) => {
    if (!config.enabled) {
      return;
    }
    analytics.track("sync_conflict_resolution", metadata);
  },
  configure: (nextConfig: Partial<ObservabilityConfig>) => {
    Object.assign(config, nextConfig);
  },
  addTransport: (transport: ObservabilityTransport) => {
    transports.add(transport);
    return () => transports.delete(transport);
  },
  getBufferedMetrics: () => [...metrics],
  clearBufferedMetrics: () => {
    metrics.length = 0;
  },
};
