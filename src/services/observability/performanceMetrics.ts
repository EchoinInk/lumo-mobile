import { analytics } from "./analytics";
import { logger } from "./logger";
import type { ObservabilityTransport, PerformanceMetric } from "./types";

const activeMeasurements = new Map<string, { name: string; startedAt: number }>();
const metrics: PerformanceMetric[] = [];
const transports = new Set<ObservabilityTransport>();
const MAX_METRIC_BUFFER = 200;

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
      logger.warn(
        "[Observability] Performance transport failed",
        undefined,
        error,
      );
    }
  });
}

export const performanceMetrics = {
  startMeasurement: (name: string): string => {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    activeMeasurements.set(id, { name, startedAt: Date.now() });
    return id;
  },
  endMeasurement: (id: string): PerformanceMetric | null => {
    const measurement = activeMeasurements.get(id);
    if (!measurement) {
      logger.warn("[Observability] Missing performance measurement", { id });
      return null;
    }

    activeMeasurements.delete(id);
    return performanceMetrics.recordMetric(
      measurement.name,
      Date.now() - measurement.startedAt,
    );
  },
  recordMetric: (name: string, value: number): PerformanceMetric => {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
    };

    remember(metric);
    sendToTransports(metric);
    analytics.track("performance_metric_recorded", { name, value });
    return metric;
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
