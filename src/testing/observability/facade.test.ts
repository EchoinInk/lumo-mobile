import { observability } from "@/services/observability";
import { assert } from "./testUtils";

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
