import { analytics, crashReporting, logger, observability, performanceMetrics, syncMetrics } from "@/services/observability";
import { storageInstance as appStorage } from "@/store/storage";

export function resetTestState(): void {
  observability.configure({ enabled: true, debugMode: false });
  logger.clearBufferedLogs();
  analytics.clearBufferedEvents();
  crashReporting.clearContext();
  crashReporting.clearBufferedCrashes();
  performanceMetrics.clearBufferedMetrics();
  syncMetrics.clearBufferedMetrics();

  globalThis.localStorage?.clear?.();
  appStorage?.remove?.("sync_queue");
  appStorage?.remove?.("sync_queue_v1");
  appStorage?.remove?.("auth_migration_tracking_v1");
}
