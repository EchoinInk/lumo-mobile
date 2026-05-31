import { analytics } from "./analytics";
import { logger } from "./logger";
import type {
  CrashContext,
  ObservabilityConfig,
  ObservabilityTransport,
} from "./types";

const context: CrashContext = {};
const captured: Array<{
  error: unknown;
  context?: CrashContext;
  timestamp: number;
}> = [];
const transports = new Set<ObservabilityTransport>();
const MAX_CRASH_BUFFER = 50;
const config: ObservabilityConfig = {
  enabled: true,
  debugMode: typeof __DEV__ !== "undefined" && __DEV__,
};

function mergeContext(incoming?: CrashContext): CrashContext {
  return {
    ...context,
    ...incoming,
    metadata: {
      ...context.metadata,
      ...incoming?.metadata,
    },
  };
}

function remember(error: unknown, crashContext?: CrashContext): void {
  captured.push({
    error,
    context: crashContext,
    timestamp: Date.now(),
  });

  if (captured.length > MAX_CRASH_BUFFER) {
    captured.shift();
  }
}

function sendToTransports(error: unknown, crashContext?: CrashContext): void {
  transports.forEach((transport) => {
    try {
      transport.crash?.(error, crashContext);
    } catch {
      // Crash reporting cannot recursively crash the app.
    }
  });
}

export const crashReporting = {
  captureException: (error: unknown, crashContext?: CrashContext): void => {
    if (!config.enabled) {
      return;
    }

    const mergedContext = mergeContext(crashContext);
    remember(error, mergedContext);
    sendToTransports(error, mergedContext);
    analytics.track("crash_exception_captured", {
      screen: mergedContext.screen,
      feature: mergedContext.feature,
    });
    logger.error("[Observability] Exception captured", error, mergedContext.metadata);
  },
  captureMessage: (message: string, crashContext?: CrashContext): void => {
    if (!config.enabled) {
      return;
    }

    const mergedContext = mergeContext(crashContext);
    remember(message, mergedContext);
    analytics.track("crash_message_captured", {
      screen: mergedContext.screen,
      feature: mergedContext.feature,
    });
    logger.warn(`[Observability] ${message}`, mergedContext.metadata);
  },
  setContext: (crashContext: CrashContext): void => {
    Object.assign(context, mergeContext(crashContext));
  },
  clearContext: (): void => {
    delete context.screen;
    delete context.feature;
    delete context.metadata;
  },
  configure: (nextConfig: Partial<ObservabilityConfig>) => {
    Object.assign(config, nextConfig);
  },
  addTransport: (transport: ObservabilityTransport) => {
    transports.add(transport);
    return () => transports.delete(transport);
  },
  getBufferedCrashes: () => [...captured],
  clearBufferedCrashes: () => {
    captured.length = 0;
  },
};
