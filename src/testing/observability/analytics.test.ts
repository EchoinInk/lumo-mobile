import { analytics, observability } from "@/services/observability";
import { assert, assertEqual, resetTestState } from "../testUtils";

export function testAnalyticsRecordsEventsWithoutSensitiveValues(): void {
  resetTestState();
  analytics.track("task_completed", {
    count: 1,
    email: "person@example.com",
  });

  const [event] = analytics.getBufferedEvents();
  assertEqual(event?.name, "task_completed", "analytics should buffer events");
  assertEqual(
    event?.properties?.email,
    "[redacted]",
    "analytics should redact sensitive property keys",
  );
  assert(typeof event?.timestamp === "number", "analytics should timestamp events");
}

export function testAnalyticsScreenRecordsSafeEvent(): void {
  resetTestState();

  analytics.screen("settings", { title: "private-ish label" });

  const [event] = analytics.getBufferedEvents();
  assertEqual(event?.name, "screen_view", "screen should record screen_view");
  assertEqual(event?.properties?.screen, "settings", "screen name should be preserved");
  assertEqual(event?.properties?.title, "[redacted]", "screen properties should be sanitized");
}

export function testAnalyticsNoOpsWhenDisabled(): void {
  resetTestState();
  observability.configure({ enabled: false });

  analytics.track("focus_mode_enabled");
  analytics.screen("dashboard");

  assertEqual(
    analytics.getBufferedEvents().length,
    0,
    "disabled analytics should not buffer events",
  );
}
