import { analytics } from "@/services/observability";
import { assertEqual } from "./testUtils";

export function testAnalyticsRecordsEventsWithoutSensitiveValues(): void {
  analytics.clearBufferedEvents();
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
}
