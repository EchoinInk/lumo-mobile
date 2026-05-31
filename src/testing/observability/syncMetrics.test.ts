import { analytics, syncMetrics } from "@/services/observability";
import { assertEqual, resetTestState } from "../testUtils";

export function testSyncMetricsRecordQueueHealth(): void {
  resetTestState();

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

export function testSyncMetricsRecordFailuresSafely(): void {
  resetTestState();

  syncMetrics.recordSyncFailure("queue_processing", new Error("network down"), {
    queueSize: 3,
  });

  const [metric] = syncMetrics.getBufferedMetrics();
  assertEqual(metric?.success, false, "sync failure should be recorded");
  assertEqual(metric?.errorMessage, "network down", "error messages should be normalized");
  assertEqual(metric?.queueSize, 3, "queue size metadata should be promoted");
}
