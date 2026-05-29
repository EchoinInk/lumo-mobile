export type ObservabilityLevel = "debug" | "info" | "warn" | "error";

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

export interface SyncMetric {
  operation: string;
  duration: number;
  success: boolean;
}

export interface CrashContext {
  screen?: string;
  feature?: string;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  level: ObservabilityLevel;
  message: string;
  metadata?: Record<string, unknown>;
  error?: unknown;
  timestamp: number;
}

export interface ObservabilityTransport {
  log?: (entry: LogEntry) => void;
  analytics?: (event: AnalyticsEvent) => void;
  performance?: (metric: PerformanceMetric) => void;
  sync?: (metric: SyncMetric) => void;
  crash?: (error: unknown, context?: CrashContext) => void;
}
