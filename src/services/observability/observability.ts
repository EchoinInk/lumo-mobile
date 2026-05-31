import { analytics } from "./analytics";
import { crashReporting } from "./crashReporting";
import { logger } from "./logger";
import { performanceMetrics } from "./performanceMetrics";
import { syncMetrics } from "./syncMetrics";
import type { ObservabilityConfig, ObservabilityTransport } from "./types";

export const observability = {
  logger,
  analytics,
  sync: syncMetrics,
  performance: performanceMetrics,
  crashes: crashReporting,
  configure: (config: Partial<ObservabilityConfig>) => {
    logger.configure(config);
    analytics.configure(config);
    syncMetrics.configure(config);
    performanceMetrics.configure(config);
    crashReporting.configure(config);
  },
  addTransport: (transport: ObservabilityTransport) => {
    const unsubscribers = [
      logger.addTransport(transport),
      analytics.addTransport(transport),
      syncMetrics.addTransport(transport),
      performanceMetrics.addTransport(transport),
      crashReporting.addTransport(transport),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  },
};
