import type {
  LogLevel,
  LogEntry,
  ObservabilityConfig,
  ObservabilityTransport,
} from "./types";

const MAX_BUFFER_SIZE = 100;
const logs: LogEntry[] = [];
const transports = new Set<ObservabilityTransport>();
const config: ObservabilityConfig = {
  enabled: true,
  debugMode: typeof __DEV__ !== "undefined" && __DEV__,
};

const sensitiveMetadataPattern =
  /email|name|phone|address|token|secret|password|content|title|description|notes?/i;

function shouldEmitToConsole(): boolean {
  return config.enabled && config.debugMode;
}

function remember(entry: LogEntry): void {
  logs.push(entry);
  if (logs.length > MAX_BUFFER_SIZE) {
    logs.shift();
  }
}

function sendToTransports(entry: LogEntry): void {
  transports.forEach((transport) => {
    try {
      transport.log?.(entry);
    } catch {
      // Observability must never break application behavior.
    }
  });
}

function safeSerializeMetadata(
  metadata?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }

  const seen = new WeakSet<object>();

  try {
    return JSON.parse(
      JSON.stringify(metadata, (key, value) => {
        if (sensitiveMetadataPattern.test(key)) {
          return "[redacted]";
        }

        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
          };
        }

        if (typeof value === "function" || typeof value === "symbol") {
          return undefined;
        }

        if (value && typeof value === "object") {
          if (seen.has(value)) {
            return "[circular]";
          }
          seen.add(value);
        }

        return value;
      }),
    ) as Record<string, unknown>;
  } catch {
    return { serializationError: true };
  }
}

function serializeError(error?: unknown): unknown {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: config.debugMode ? error.stack : undefined,
    };
  }

  return error;
}

function emit(
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown>,
  error?: unknown,
): void {
  if (!config.enabled) {
    return;
  }

  const entry: LogEntry = {
    level,
    message,
    metadata: safeSerializeMetadata(metadata),
    error: serializeError(error),
    timestamp: Date.now(),
  };

  remember(entry);
  sendToTransports(entry);

  if (!shouldEmitToConsole()) {
    return;
  }

  const payload = entry.metadata ?? entry.error;
  if (payload !== undefined && entry.error !== undefined) {
    console[level](message, entry.metadata, entry.error);
    return;
  }

  if (payload !== undefined) {
    console[level](message, payload);
    return;
  }

  console[level](message);
}

export const logger = {
  debug: (message: string, metadata?: Record<string, unknown>) =>
    emit("debug", message, metadata),
  info: (message: string, metadata?: Record<string, unknown>) =>
    emit("info", message, metadata),
  warn: (message: string, metadata?: Record<string, unknown>, error?: unknown) =>
    emit("warn", message, metadata, error),
  error: (
    message: string,
    error?: unknown,
    metadata?: Record<string, unknown>,
  ) => emit("error", message, metadata, error),
  configure: (nextConfig: Partial<ObservabilityConfig>) => {
    Object.assign(config, nextConfig);
  },
  getConfig: () => ({ ...config }),
  addTransport: (transport: ObservabilityTransport) => {
    transports.add(transport);
    return () => transports.delete(transport);
  },
  getBufferedLogs: () => [...logs],
  clearBufferedLogs: () => {
    logs.length = 0;
  },
};
