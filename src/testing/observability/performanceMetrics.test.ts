import { performanceMetrics } from "@/services/observability";
import { assert, assertEqual } from "./testUtils";

export function testPerformanceMeasurementsRecordDurations(): void {
  performanceMetrics.clearBufferedMetrics();

  const measurementId = performanceMetrics.startMeasurement("startup_duration");
  const metric = performanceMetrics.endMeasurement(measurementId);

  assert(metric !== null, "performance measurement should end successfully");
  assertEqual(
    metric?.name,
    "startup_duration",
    "performance metric should preserve measurement name",
  );
}
