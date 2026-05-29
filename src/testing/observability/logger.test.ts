import { logger } from "@/services/observability";
import { assert, assertEqual } from "./testUtils";

export function testLoggerRecordsStableApi(): void {
  logger.clearBufferedLogs();
  logger.info("Logger API stability test", { source: "observability_test" });

  const logs = logger.getBufferedLogs();
  assertEqual(logs.length, 1, "logger should buffer one log entry");
  assertEqual(logs[0]?.level, "info", "logger should preserve log level");
  assert(
    typeof logger.debug === "function" &&
      typeof logger.info === "function" &&
      typeof logger.warn === "function" &&
      typeof logger.error === "function",
    "logger should expose debug/info/warn/error",
  );
}
