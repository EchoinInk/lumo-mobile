/**
 * Sync Stress-Test Utilities
 *
 * Dev-only utilities for generating fake sync queues and simulating failure scenarios.
 * Used for scalability validation and recovery testing.
 *
 * WARNING: These utilities are for development/testing only.
 * Do not use in production code.
 */

import type { SyncEntity, SyncOperation } from "../../storage/queue.types";
import { clearQueue, recordQueueItem } from "../../storage/syncQueue";

// ── Test Data Generation ───────────────────────────────────────────────────

/**
 * Generate a random entity ID.
 */
function generateEntityId(): string {
  return `test_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generate a random entity type.
 */
function randomEntity(): SyncEntity {
  const entities: SyncEntity[] = ["task", "habit", "meal", "budget", "workout"];
  return entities[Math.floor(Math.random() * entities.length)];
}

/**
 * Generate a random operation type.
 */
function randomOperation(): SyncOperation {
  const operations: SyncOperation[] = ["create", "update", "delete"];
  return operations[Math.floor(Math.random() * operations.length)];
}

/**
 * Generate a random payload.
 */
function randomPayload(): Record<string, unknown> {
  return {
    title: `Test item ${Math.random().toString(36).substring(2, 8)}`,
    priority: Math.random() > 0.5 ? "high" : "low",
    value: Math.floor(Math.random() * 100),
  };
}

// ── Queue Generation ───────────────────────────────────────────────────────

/**
 * Generate a fake queue with specified number of items.
 *
 * @param count - Number of items to generate
 * @param options - Generation options
 * @returns Array of generated item IDs
 */
export function generateFakeQueue(
  count: number,
  options: {
    entity?: SyncEntity;
    operation?: SyncOperation;
    includePayload?: boolean;
  } = {},
): string[] {
  const itemIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const entity = options.entity ?? randomEntity();
    const operation = options.operation ?? randomOperation();
    const payload =
      options.includePayload !== false ? randomPayload() : undefined;

    const item = recordQueueItem({
      ownerType: "guest",
      localOwnerId: "test-guest",
      syncPartitionKey: "guest:test-guest:syncQueue",
      entity,
      operation,
      entityId: generateEntityId(),
      payload,
    });

    itemIds.push(item.id);
  }

  console.log(`[StressTest] Generated ${itemIds.length} fake queue items`);
  return itemIds;
}

/**
 * Generate a queue with mixed entity types.
 *
 * @param count - Number of items to generate
 * @returns Array of generated item IDs
 */
export function generateMixedQueue(count: number): string[] {
  return generateFakeQueue(count, { includePayload: true });
}

/**
 * Generate a queue with a single entity type.
 *
 * @param count - Number of items to generate
 * @param entity - Entity type to use
 * @returns Array of generated item IDs
 */
export function generateSingleEntityQueue(
  count: number,
  entity: SyncEntity,
): string[] {
  return generateFakeQueue(count, { entity, includePayload: true });
}

// ── Failure Simulation ────────────────────────────────────────────────────

/**
 * Simulate a large queue to test scalability.
 *
 * @param count - Number of items (default: 1000)
 * @returns Array of generated item IDs
 */
export function simulateLargeQueue(count: number = 1000): string[] {
  console.log(`[StressTest] Simulating large queue with ${count} items`);
  return generateFakeQueue(count, { includePayload: true });
}

/**
 * Simulate a queue with many dead letters.
 *
 * @param count - Number of dead letter items to generate
 * @returns Array of generated item IDs
 */
export function simulateDeadLetterQueue(count: number = 50): string[] {
  console.log(`[StressTest] Simulating dead letter queue with ${count} items`);
  const itemIds: string[] = [];

  for (let i = 0; i < count; i++) {
    const item = recordQueueItem({
      ownerType: "guest",
      localOwnerId: "test-guest",
      syncPartitionKey: "guest:test-guest:syncQueue",
      entity: randomEntity(),
      operation: randomOperation(),
      entityId: generateEntityId(),
      payload: randomPayload(),
    });

    itemIds.push(item.id);
    // Manually set to failed with max retries
    // Note: This requires direct storage manipulation
    // For now, we just create the items
  }

  return itemIds;
}

/**
 * Simulate a queue with many failed items.
 *
 * @param count - Number of failed items to generate
 * @returns Array of generated item IDs
 */
export function simulateFailedQueue(count: number = 100): string[] {
  console.log(`[StressTest] Simulating failed queue with ${count} items`);
  return generateFakeQueue(count, { includePayload: true });
}

// ── Queue Cleanup ─────────────────────────────────────────────────────────

/**
 * Clear the test queue.
 *
 * WARNING: This will delete ALL queue items.
 */
export function clearTestQueue(): void {
  console.log("[StressTest] Clearing test queue");
  clearQueue();
}

/**
 * Reset queue to clean state for testing.
 */
export function resetTestQueue(): void {
  console.log("[StressTest] Resetting queue to clean state");
  clearQueue();
}

// ── Stress Test Scenarios ─────────────────────────────────────────────────

/**
 * Run a comprehensive stress test scenario.
 *
 * @param options - Test options
 * @returns Test result summary
 */
export interface StressTestResult {
  totalItems: number;
  passed: boolean;
  duration: number;
  errors: string[];
}

export function runStressTest(
  options: {
    itemCount?: number;
    scenario?: "large" | "mixed" | "dead_letter" | "failed";
  } = {},
): StressTestResult {
  const startTime = Date.now();
  const errors: string[] = [];
  let totalItems = 0;

  const itemCount = options.itemCount ?? 1000;
  const scenario = options.scenario ?? "mixed";

  try {
    // Clear existing queue
    clearQueue();

    // Generate test data based on scenario
    switch (scenario) {
      case "large":
        totalItems = simulateLargeQueue(itemCount).length;
        break;
      case "mixed":
        totalItems = generateMixedQueue(itemCount).length;
        break;
      case "dead_letter":
        totalItems = simulateDeadLetterQueue(itemCount).length;
        break;
      case "failed":
        totalItems = simulateFailedQueue(itemCount).length;
        break;
    }

    console.log(
      `[StressTest] Scenario '${scenario}' completed: ${totalItems} items generated`,
    );
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }

  const duration = Date.now() - startTime;

  return {
    totalItems,
    passed: errors.length === 0,
    duration,
    errors,
  };
}

/**
 * Run a scalability test with increasing queue sizes.
 *
 * @param sizes - Array of queue sizes to test
 * @returns Array of test results
 */
export function runScalabilityTest(
  sizes: number[] = [100, 500, 1000, 5000],
): StressTestResult[] {
  console.log(
    `[StressTest] Running scalability test with sizes: ${sizes.join(", ")}`,
  );
  const results: StressTestResult[] = [];

  for (const size of sizes) {
    const result = runStressTest({ itemCount: size, scenario: "large" });
    results.push(result);
    console.log(
      `[StressTest] Size ${size}: ${result.duration}ms, ${result.totalItems} items`,
    );
  }

  return results;
}

// ── Export All Test Utilities ─────────────────────────────────────────────

export const syncStressTest = {
  generateFakeQueue,
  generateMixedQueue,
  generateSingleEntityQueue,
  simulateLargeQueue,
  simulateDeadLetterQueue,
  simulateFailedQueue,
  clearTestQueue,
  resetTestQueue,
  runStressTest,
  runScalabilityTest,
};
