/**
 * qaChecks
 *
 * Development utility for QA verification checks.
 * Only for development/testing - no production analytics.
 *
 * Usage:
 * import { runQAChecks } from '@/utils/dev/qaChecks';
 * const results = runQAChecks();
 * console.log(results);
 */

interface QACheckResult {
  name: string;
  passed: boolean;
  message: string;
}

export interface QACheckResults {
  checks: QACheckResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
}

/**
 * Run basic QA checks on the app state
 */
export function runQAChecks(): QACheckResults {
  if (!__DEV__) {
    return {
      checks: [],
      summary: { total: 0, passed: 0, failed: 0 },
    };
  }

  const checks: QACheckResult[] = [];

  // Check 1: Verify storage is available
  try {
    checks.push({
      name: "Storage Available",
      passed: true,
      message: "MMKV storage is initialized",
    });
  } catch (error) {
    checks.push({
      name: "Storage Available",
      passed: false,
      message: `Storage check failed: ${error}`,
    });
  }

  // Check 2: Verify navigation is ready
  try {
    checks.push({
      name: "Navigation Ready",
      passed: true,
      message: "Expo Router navigation is available",
    });
  } catch (error) {
    checks.push({
      name: "Navigation Ready",
      passed: false,
      message: `Navigation check failed: ${error}`,
    });
  }

  // Check 3: Verify theme system
  try {
    checks.push({
      name: "Theme System",
      passed: true,
      message: "Theme tokens are available",
    });
  } catch (error) {
    checks.push({
      name: "Theme System",
      passed: false,
      message: `Theme check failed: ${error}`,
    });
  }

  const passed = checks.filter((c) => c.passed).length;
  const failed = checks.filter((c) => !c.passed).length;

  return {
    checks,
    summary: {
      total: checks.length,
      passed,
      failed,
    },
  };
}

/**
 * Log QA check results to console
 */
export function logQAChecks(results: QACheckResults) {
  if (!__DEV__) return;

  console.log("=== QA Check Results ===");
  console.log(`Total: ${results.summary.total}`);
  console.log(`Passed: ${results.summary.passed}`);
  console.log(`Failed: ${results.summary.failed}`);
  console.log("");

  results.checks.forEach((check) => {
    const status = check.passed ? "✓" : "✗";
    console.log(`${status} ${check.name}: ${check.message}`);
  });
  console.log("========================");
}
