import { crashReporting } from "@/services/observability";
import { assertEqual } from "./testUtils";

export function testCrashReportingBuffersExceptions(): void {
  crashReporting.clearBufferedCrashes();
  crashReporting.captureException(new Error("test error"), {
    feature: "observability_test",
  });

  const crashes = crashReporting.getBufferedCrashes();
  assertEqual(crashes.length, 1, "crash reporting should buffer exceptions");
  assertEqual(
    crashes[0]?.context?.feature,
    "observability_test",
    "crash reporting should preserve context",
  );
}
