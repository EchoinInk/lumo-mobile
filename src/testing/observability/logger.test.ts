import { logger } from "@/services/observability";
import { assert, assertEqual, resetTestState } from "../testUtils";

export function testLoggerRecordsStableApi(): void {
  resetTestState();
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

export function testLoggerNoOpsWhenDisabled(): void {
  resetTestState();
  logger.configure({ enabled: false });

  logger.error("disabled logger should not buffer", new Error("quiet"));

  assertEqual(logger.getBufferedLogs().length, 0, "disabled logger should no-op");
}

export function testLoggerStaysQuietOutsideDebugMode(): void {
  resetTestState();
  const originalInfo = console.info;
  let calls = 0;
  console.info = () => {
    calls += 1;
  };

  try {
    logger.configure({ enabled: true, debugMode: false });
    logger.info("quiet outside debug mode");
  } finally {
    console.info = originalInfo;
  }

  assertEqual(calls, 0, "logger should not write console output outside debug mode");
  assertEqual(logger.getBufferedLogs().length, 1, "quiet logs should still buffer");
}

export function testLoggerSafelySerializesMetadata(): void {
  resetTestState();
  const metadata: Record<string, unknown> = {
    email: "person@example.com",
    nested: {},
  };
  metadata.self = metadata;

  logger.debug("serialize metadata", metadata);

  const [entry] = logger.getBufferedLogs();
  assertEqual(entry?.metadata?.email, "[redacted]", "sensitive keys are redacted");
  assertEqual(entry?.metadata?.self, "[circular]", "circular metadata is safe");
}
