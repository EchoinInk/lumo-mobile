import { observability } from "@/services/observability";
import { assert, assertEqual, resetTestState } from "../testUtils";

export function testObservabilityFacadeShape(): void {
  assert(Boolean(observability.logger), "facade should expose logger");
  assert(Boolean(observability.analytics), "facade should expose analytics");
  assert(Boolean(observability.sync), "facade should expose sync metrics");
  assert(
    Boolean(observability.performance),
    "facade should expose performance metrics",
  );
  assert(Boolean(observability.crashes), "facade should expose crash reporting");
}

export function testObservabilityFacadeConfiguresDomains(): void {
  resetTestState();

  observability.configure({ enabled: false });
  observability.analytics.track("calm_mode_enabled");
  observability.logger.info("quiet");

  assertEqual(
    observability.analytics.getBufferedEvents().length,
    0,
    "facade config should disable analytics",
  );
  assertEqual(
    observability.logger.getBufferedLogs().length,
    0,
    "facade config should disable logger",
  );
}
