import type {
  LogEntry,
  ObservabilityLevel,
  ObservabilityTransport,
} from "./types";

const MAX_BUFFER_SIZE = 100;
const logs: LogEntry[] = [];
const transports = new Set<ObservabilityTransport>();

function shouldEmitToConsole(level: ObservabilityLevel): boolean {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    return true;
  }

  return level === "warn" || level === "error";
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

function emit(
  level: ObservabilityLevel,
  message: string,
  metadata?: Record<string, unknown>,
  error?: unknown,
): void {
  const entry: LogEntry = {
    level,
    message,
    metadata,
    error,
    timestamp: Date.now(),
  };

  remember(entry);
  sendToTransports(entry);

  if (!shouldEmitToConsole(level)) {
    return;
  }

  const payload = metadata ?? error;
  if (payload !== undefined && error !== undefined) {
    console[level](message, metadata, error);
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
    metadata?: Record<string, unknown>,
    error?: unknown,
  ) => emit("error", message, metadata, error),
  addTransport: (transport: ObservabilityTransport) => {
    transports.add(transport);
    return () => transports.delete(transport);
  },
  getBufferedLogs: () => [...logs],
  clearBufferedLogs: () => {
    logs.length = 0;
  },
};
