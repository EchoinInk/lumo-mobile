import { analytics } from "./analytics";
import { crashReporting } from "./crashReporting";
import { logger } from "./logger";
import { performanceMetrics } from "./performanceMetrics";
import { syncMetrics } from "./syncMetrics";
import type { ObservabilityTransport } from "./types";

export const observability = {
  logger,
  analytics,
  sync: syncMetrics,
  performance: performanceMetrics,
  crashes: crashReporting,
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
