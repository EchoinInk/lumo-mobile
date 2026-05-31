export type LogLevel = "debug" | "info" | "warn" | "error";
export type ObservabilityLevel = LogLevel;

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface SyncMetric {
  operation: string;
  duration?: number;
  success: boolean;
  queueSize?: number;
  errorMessage?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface CrashContext {
  screen?: string;
  feature?: string;
  metadata?: Record<string, unknown>;
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  error?: unknown;
  timestamp: number;
}

export interface ObservabilityConfig {
  enabled: boolean;
  debugMode: boolean;
}

export interface ObservabilityTransport {
  log?: (entry: LogEntry) => void;
  analytics?: (event: AnalyticsEvent) => void;
  performance?: (metric: PerformanceMetric) => void;
  sync?: (metric: SyncMetric) => void;
  crash?: (error: unknown, context?: CrashContext) => void;
}
