import { analytics, syncMetrics } from "@/services/observability";
import { assertEqual } from "./testUtils";

export function testSyncMetricsRecordQueueHealth(): void {
  analytics.clearBufferedEvents();
  syncMetrics.clearBufferedMetrics();

  syncMetrics.recordSyncSuccess("queue_processing", 12, { processed: 2 });
  syncMetrics.recordQueueReplay(2);

  const metrics = syncMetrics.getBufferedMetrics();
  const events = analytics.getBufferedEvents();

  assertEqual(metrics.length, 1, "sync metrics should buffer sync result");
  assertEqual(metrics[0]?.success, true, "sync success should be recorded");
  assertEqual(
    events.some((event) => event.name === "sync_queue_replay"),
    true,
    "queue replay should emit a health event",
  );
}
