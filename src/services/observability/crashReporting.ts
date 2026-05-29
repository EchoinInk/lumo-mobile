import { analytics } from "./analytics";
import { logger } from "./logger";
import type { CrashContext, ObservabilityTransport } from "./types";

const context: CrashContext = {};
const captured: Array<{ error: unknown; context?: CrashContext; timestamp: number }> =
  [];
const transports = new Set<ObservabilityTransport>();
const MAX_CRASH_BUFFER = 50;

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
    const mergedContext = mergeContext(crashContext);
    remember(error, mergedContext);
    sendToTransports(error, mergedContext);
    analytics.track("crash_exception_captured", {
      screen: mergedContext.screen,
      feature: mergedContext.feature,
    });
    logger.error("[Observability] Exception captured", mergedContext.metadata, error);
  },
  captureMessage: (message: string, crashContext?: CrashContext): void => {
    const mergedContext = mergeContext(crashContext);
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
  addTransport: (transport: ObservabilityTransport) => {
    transports.add(transport);
    return () => transports.delete(transport);
  },
  getBufferedCrashes: () => [...captured],
  clearBufferedCrashes: () => {
    captured.length = 0;
  },
};
