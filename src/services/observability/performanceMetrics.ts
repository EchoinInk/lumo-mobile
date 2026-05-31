import { analytics } from "./analytics";
import { logger } from "./logger";
import type {
  ObservabilityConfig,
  ObservabilityTransport,
  PerformanceMetric,
} from "./types";

const activeMeasurements = new Map<
  string,
  { name: string; startedAt: number; metadata?: Record<string, unknown> }
>();
const metrics: PerformanceMetric[] = [];
const transports = new Set<ObservabilityTransport>();
const MAX_METRIC_BUFFER = 200;
const config: ObservabilityConfig = {
  enabled: true,
  debugMode: typeof __DEV__ !== "undefined" && __DEV__,
};

function now(): number {
  if (
    typeof performance !== "undefined" &&
    typeof performance.now === "function"
  ) {
    return performance.now();
  }

  return Date.now();
}

function remember(metric: PerformanceMetric): void {
  metrics.push(metric);
  if (metrics.length > MAX_METRIC_BUFFER) {
    metrics.shift();
  }
}

function sendToTransports(metric: PerformanceMetric): void {
  transports.forEach((transport) => {
    try {
      transport.performance?.(metric);
    } catch (error) {
      logger.error("[Observability] Performance transport failed", error);
    }
  });
}

export const performanceMetrics = {
  startMeasurement: (name: string, metadata?: Record<string, unknown>): string => {
    if (!config.enabled) {
      return name;
    }

    const id = `${name}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const measurement = { name, startedAt: now(), metadata };
    activeMeasurements.set(id, measurement);
    activeMeasurements.set(name, measurement);
    return id;
  },
  endMeasurement: (
    nameOrId: string,
    metadata?: Record<string, unknown>,
  ): PerformanceMetric | null => {
    if (!config.enabled) {
      return null;
    }

    const measurement = activeMeasurements.get(nameOrId);
    if (!measurement) {
      logger.warn("[Observability] Missing performance measurement", {
        nameOrId,
      });
      return null;
    }

    activeMeasurements.delete(nameOrId);
    activeMeasurements.delete(measurement.name);
    return performanceMetrics.recordMetric(
      measurement.name,
      now() - measurement.startedAt,
      {
        ...measurement.metadata,
        ...metadata,
      },
    );
  },
  recordMetric: (
    name: string,
    value: number,
    metadata?: Record<string, unknown>,
  ): PerformanceMetric => {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    if (!config.enabled) {
      return metric;
    }

    remember(metric);
    sendToTransports(metric);
    analytics.track("performance_metric_recorded", { name, value, ...metadata });
    return metric;
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
    activeMeasurements.clear();
    metrics.length = 0;
  },
};
