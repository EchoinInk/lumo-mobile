import { crashReporting } from "@/services/observability";
import { assertEqual, resetTestState } from "../testUtils";

export function testCrashReportingBuffersExceptions(): void {
  resetTestState();
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

export function testCrashReportingContextSetAndClear(): void {
  resetTestState();

  crashReporting.setContext({
    screen: "dashboard",
    metadata: { routeGroup: "tabs" },
  });
  crashReporting.captureMessage("context check", { feature: "startup" });

  let [message] = crashReporting.getBufferedCrashes();
  assertEqual(message?.context?.screen, "dashboard", "set context should merge");
  assertEqual(message?.context?.feature, "startup", "incoming context should merge");

  crashReporting.clearContext();
  crashReporting.clearBufferedCrashes();
  crashReporting.captureMessage("cleared context");

  [message] = crashReporting.getBufferedCrashes();
  assertEqual(message?.context?.screen, undefined, "clear context should remove screen");
}
