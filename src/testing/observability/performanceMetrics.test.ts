import { performanceMetrics } from "@/services/observability";
import { assert, assertEqual, resetTestState } from "../testUtils";

export function testPerformanceMeasurementsRecordDurations(): void {
  resetTestState();

  const measurementId = performanceMetrics.startMeasurement("startup_duration", {
    phase: "boot",
  });
  const metric = performanceMetrics.endMeasurement(measurementId, {
    complete: true,
  });

  assert(metric !== null, "performance measurement should end successfully");
  assertEqual(
    metric?.name,
    "startup_duration",
    "performance metric should preserve measurement name",
  );
  assertEqual(metric?.metadata?.phase, "boot", "start metadata should be preserved");
  assertEqual(metric?.metadata?.complete, true, "end metadata should merge");
}

export function testPerformanceMissingMeasurementIsSafe(): void {
  resetTestState();

  const metric = performanceMetrics.endMeasurement("missing");

  assertEqual(metric, null, "missing measurements should return null");
}
