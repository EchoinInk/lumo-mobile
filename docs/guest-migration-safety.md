# Guest Migration Safety

## Phase 13.4 — Guest Account Migration Safety Integration

Migration correctness phase focusing on migration safety before destructive cleanup. This phase implements safety and observability layers for guest → account migration without performing any destructive operations, and integrates the migration utilities into a coherent orchestration flow.

## Overview

Phase 13.4 adds migration safety infrastructure to ensure guest data can be safely moved into authenticated ownership before deleting anything. This is a safety + observability layer only — no destructive cleanup occurs in this phase.

### Core Principles

- Migration correctness before destructive cleanup
- No automatic deletion
- No silent destructive migration
- No sync replay
- No social login
- No analytics
- No notifications
- Preserve rollback capability
- Preserve local-first behavior
- Deterministic ownership only

## Architecture

### Flow

```
Migration Preview
  → Migration Copy
    → Migration Validation
      → Conflict Resolution
        → Sync Queue Transfer
          → Orphaned Partition Tracking
            → Rollback Safety
```

### Orchestration Flow

The guest migration orchestrator integrates all safety utilities into a deterministic safety pass:

1. **Previewing** — Scan guest partitions and calculate migration size/complexity
2. **Checking Conflicts** — Identify potential conflicts (skipped in current implementation)
3. **Copying** — Copy guest partitions to authenticated partitions
4. **Validating** — Validate copied data integrity
5. **Preparing Rollback** — Create rollback snapshot metadata
6. **Preparing Sync Transfer** — Prepare sync queue for ownership transfer
7. **Tracking Orphaned Guest** — Track migrated guest partitions
8. **Completed** — Safety pass complete

### Safety Pass Lifecycle

```
Idle → Previewing → Checking Conflicts → Copying → Validating → Preparing Rollback → Preparing Sync Transfer → Tracking Orphaned Guest → Completed
                                    ↓
                                 Failed
```

### Failure Behavior

If any step fails:

- Stop immediately
- Preserve rollback metadata if already created
- Source guest data remains untouched
- Target authenticated data not corrupted
- Error message captured in report
- Failure reason recorded
- Rollback remains available if snapshot exists

### Never

```
Direct Supabase calls from migration utilities
Automatic deletion of guest partitions
Global MMKV wipe
Sync queue replay
Automatic migration on login
```

## Files Created

**Migration Safety Utilities**

- `src/features/auth/services/migrationPreview.ts` — Migration preview utilities (scan guest partitions, calculate migration size/complexity, identify potential conflicts)
- `src/features/auth/services/migrationCopy.ts` — Deterministic partition copy utilities (copy entity data from guest to authenticated partitions, preserve data integrity)
- `src/features/auth/services/migrationValidation.ts` — Migration validation utilities (validate copied data integrity, verify entity counts match, detect data corruption)
- `src/features/auth/services/migrationConflictStrategy.ts` — Conflict strategy scaffolding (define conflict resolution strategies, detect conflict types, apply conflict resolution)
- `src/features/auth/services/migrationRollback.ts` — Safe rollback path utilities (create rollback snapshot before migration, restore from rollback snapshot, validate rollback integrity)
- `src/features/auth/services/migrationSyncQueueTransfer.ts` — Sync queue transfer preparation utilities (prepare guest-owned sync queue items for authenticated ownership, convert ownership metadata)
- `src/features/auth/services/migrationOrphanedGuestTracking.ts` — Orphaned guest partition tracking utilities (track migrated/orphaned guest partitions, detect cleanup candidates, preserve rollback capability)

**Migration Orchestration (Phase 13.4 Integration)**

- `src/features/auth/types/migration.types.ts` — Migration type definitions (steps, statuses, reports, results)
- `src/features/auth/services/guestMigrationOrchestrator.ts` — Migration orchestration service (integrates safety utilities into deterministic flow)
- `src/features/auth/hooks/useGuestMigrationStatus.ts` — Migration status hook (exposes migration state and safe action methods)

**Integration Updates**

- `src/features/auth/services/authTransitionOrchestrator.ts` — Added `prepareGuestUpgradeSafety()` and `completeGuestUpgradeSafety()` methods
- `app/(tabs)/more/account.tsx` — Added debug-only migration diagnostics section

## Orphaned Partition Model

### Partition Statuses

- **active** — Guest partition currently in use by active session
- **migrated** — Guest partition successfully migrated to authenticated ownership
- **orphaned** — Guest partition with no active ownership and no migration record
- **rollback_available** — Guest partition with rollback snapshot still available
- **cleanup_candidate** — Guest partition eligible for safe cleanup

### Orphaned Partition Detection

A partition is orphaned when:

- `localOwnerId` no longer matches active guest session
- No authenticated ownership exists
- Migration incomplete or abandoned
- Rollback still possible

### Cleanup Candidate Rules

Cleanup candidates are NOT auto-deleted. They are only marked as candidates. Cleanup requires:

- Successful validation
- Rollback window elapsed (7 days)
- Migration completed
- No active session ownership
- No pending sync transfer state

## Rollback Model

### Rollback Snapshot

Rollback snapshots capture the state of authenticated partitions before migration:

- Snapshot ID: `rollback_{timestamp}_{random}`
- Timestamp: When snapshot was created
- Target context: Authenticated repository context
- Target data backup: Map of partition keys to data

### Rollback Restoration

Rollback restoration:

- Restores target partitions from snapshot
- Deletes keys created during migration
- Validates rollback integrity
- Preserves source guest data

### Rollback Safety

Rollback safety checks:

- Cannot rollback if no snapshot exists
- Cannot rollback if migration already rolled back
- Cannot rollback if cleanup has occurred
- Rollback safety prioritized over storage cleanup

## Migration Tracking Lifecycle

### Tracking Record Creation

Tracking records are created when migration starts:

- `localOwnerId` — Guest local owner ID
- `cloudOwnerId` — Authenticated cloud owner ID (optional)
- `migrationStartedAt` — Migration start timestamp
- `migrationCompletedAt` — Migration completion timestamp (optional)
- `rollbackAvailable` — Whether rollback is available
- `cleanupEligible` — Whether cleanup is eligible
- `migratedPartitions` — List of migrated partition keys
- `migratedSyncPartitions` — List of migrated sync partition keys
- `validationPassed` — Whether validation passed
- `migrationVersion` — Migration version string
- `rollbackSnapshotId` — Rollback snapshot ID (optional)

### Tracking Record Updates

Tracking records are updated when:

- Migration completes (`migrationCompletedAt` set)
- Validation passes (`validationPassed` set to true)
- Rollback performed (`rollbackAvailable` set to false)
- Cleanup eligible (`cleanupEligible` set to true)

### Tracking Record Deletion

Tracking records are never deleted in Phase 13.4. Deletion is deferred to future cleanup phases.

## Why Deletion is Deferred

Deletion is deferred for safety reasons:

1. **Rollback Capability** — Guest partitions must remain available for rollback until rollback window expires
2. **Validation Safety** — Deletion only after validation passes and rollback window expires
3. **User Control** — Users should have visibility into what will be deleted before deletion occurs
4. **Debugging** — Orphaned partitions provide debugging information for migration issues
5. **Recovery** — Preserves ability to recover from migration failures

## Future Cleanup Phase Boundaries

### Phase 13.5 — Migration Orchestration

- Integrate migration utilities into auth transition orchestrator
- Create migration orchestration service
- Add migration UI for user confirmation
- Add migration progress tracking
- Add migration error recovery

### Phase 13.6 — Destructive Guest Partition Cleanup

- Implement destructive guest partition cleanup (only after validation passes)
- Add user confirmation for cleanup
- Add cleanup progress tracking
- Add cleanup error recovery
- Delete orphaned guest partitions after rollback window expires

## Migration Orchestration API

### Guest Migration Orchestrator

```typescript
// Create migration preview
createGuestMigrationPreview(sourceContext, targetContext)
  → Promise<MigrationPreview>

// Run full safety pass
runGuestMigrationSafetyPass(sourceContext, targetContext)
  → Promise<GuestMigrationSafetyResult>

// Validate safety pass
validateGuestMigrationSafetyPass(migrationId)
  → boolean

// Prepare rollback
prepareGuestMigrationRollback(migrationId)
  → boolean

// Get migration status
getGuestMigrationStatus()
  → { status, report, isRunning }

// Reset migration state
resetGuestMigrationSafetyState()
  → void
```

### Auth Transition Orchestrator Integration

```typescript
// Prepare guest upgrade safety (explicit call only)
prepareGuestUpgradeSafety(sourceContext, targetContext)
  → Promise<GuestMigrationSafetyResult>

// Complete guest upgrade safety
completeGuestUpgradeSafety(migrationId)
  → boolean
```

### Migration Status Hook

```typescript
useGuestMigrationStatus()
  → {
      status,
      latestReport,
      rollbackAvailable,
      cleanupEligible,
      error,
      prepareRollback,
      validateMigration,
      resetState
    }

useIsMigrationRunning()
  → boolean

useMigrationStatus()
  → GuestMigrationStatus
```

## Migration Utilities API

### Migration Preview

```typescript
generateMigrationPreview(sourceContext, targetContext)
  → MigrationPreview

summarizeMigrationPreview(preview)
  → string

isMigrationSafe(preview)
  → boolean

getMigrationWarnings(preview)
  → string[]
```

### Migration Copy

```typescript
copyGuestToAuthenticated(sourceContext, targetContext)
  → MigrationCopyReport

summarizeMigrationCopy(report)
  → string

isCopySuccessful(report)
  → boolean

getCopyErrors(report)
  → string[]
```

### Migration Validation

```typescript
validateMigrationCopy(sourceContext, targetContext)
  → MigrationValidationReport

summarizeMigrationValidation(report)
  → string

isMigrationValid(report)
  → boolean

getValidationErrors(report)
  → string[]
```

### Conflict Strategy

```typescript
detectConflicts(sourceContext, targetContext)
  → ConflictInfo[]

applyConflictResolution(conflict, strategy)
  → ConflictResolution

resolveAllConflicts(conflicts, strategy)
  → ConflictResolutionReport

summarizeConflicts(conflicts)
  → string

getRecommendedStrategy(conflict)
  → ConflictResolutionStrategy

areConflictsResolvable(conflicts)
  → boolean
```

### Rollback

```typescript
createRollbackSnapshot(targetContext)
  → RollbackSnapshot

restoreFromSnapshot(snapshot)
  → RollbackResult

cleanupSnapshot(snapshot)
  → void

validateRollback(snapshot)
  → { valid: boolean, errors: string[] }

summarizeSnapshot(snapshot)
  → string

summarizeRollbackResult(result)
  → string
```

### Sync Queue Transfer

```typescript
createSyncQueueTransferPreview(sourceContext, targetContext)
  → SyncQueueTransferPreview

prepareSyncQueueTransfer(preview)
  → SyncQueueTransferResult

validateSyncQueueTransfer(result)
  → SyncQueueTransferValidation

formatSyncQueueTransferReport(preview, result, validation)
  → string
```

### Orphaned Guest Tracking

```typescript
discoverGuestPartitions(activeLocalOwnerId)
  → Map<string, OrphanedGuestPartition[]>

detectOrphanedGuestPartitions(activeLocalOwnerId)
  → OrphanedGuestPartition[]

createMigrationTrackingRecord(localOwnerId, cloudOwnerId, migratedPartitions, migratedSyncPartitions)
  → MigrationTrackingRecord

updateMigrationTrackingRecord(localOwnerId, updates)
  → MigrationTrackingRecord

getMigrationTrackingRecord(localOwnerId)
  → MigrationTrackingRecord | undefined

getCleanupCandidates(activeLocalOwnerId)
  → GuestPartitionCleanupCandidate[]

canSafelyRollbackMigration(localOwnerId)
  → boolean

canSafelyCleanupPartition(localOwnerId)
  → boolean

formatOrphanedPartitionReport(activeLocalOwnerId)
  → string
```

## Safety Guards

### Internal Assertions

- Prevent duplicate tracking records
- Prevent cleanup during migration
- Prevent rollback loss
- Prevent authenticated partition misclassification

### Rollback Safety

- Cleanup must fail closed
- Rollback safety prioritized over storage cleanup
- Never allow cleanup during:
  - Active migration
  - Pending sync transfer
  - Failed validation
  - Missing migration records

## What Phase 13.4 Does NOT Do

- No automatic deletion
- No silent destructive migration
- No sync replay
- No social login
- No analytics
- No notifications
- No guest partition deletion
- No global MMKV wipe
- No Supabase calls from migration utilities
- No repository mutation
- No auth UI changes

## Verification

- TypeScript passes with no errors (migration files do not introduce new errors)
- No broken imports from planned but uncreated files
- Migration utilities are self-contained and not yet integrated
- No destructive cleanup occurs
- No Supabase calls exist in migration utilities
- No sync replay occurs
- No guest data deletion occurs
- Rollback path remains possible
- Authenticated partitions remain untouched

## Risks

1. **Guest Data Orphaning** — Logout generates new localOwnerId, orphaning old guest data. Cleanup needed in Phase 13.6.
2. **Migration Record Loss** — If MMKV is cleared, migration tracking records are lost. Future phases should add backup to secure storage.
3. **Rollback Window** — 7-day rollback window may be too short for some users. Future phases should make this configurable.
4. **Partition Discovery** — Current implementation relies on migration tracking records for partition discovery. Future phases should add fallback discovery methods.

## Deferred Work

Recommended next steps to complete Phase 13.4:

- Integrate migration utilities into auth transition orchestrator
- Create migration orchestration service
- Add migration UI for user confirmation
- Add migration progress tracking
- Add migration error recovery

Recommended next phases:

- Phase 13.5 — Migration Orchestration
- Phase 13.6 — Destructive Guest Partition Cleanup
- Phase 13.7 — Migration Backup to Secure Storage
- Phase 13.8 — Configurable Rollback Window

## Migration Test Harness (Phase 13.6)

### Purpose

The migration test harness is a development-only tool for proving the guest → account migration safety pass works with disposable local data before destructive cleanup is introduced. This is testing + verification only.

### How to Run

1. Open the app in development mode (`__DEV__` is true)
2. Navigate to the Account screen (requires authentication)
3. In the "Migration Diagnostics (Dev Only)" section, click "Run migration safety test"
4. View the test results in the harness result text
5. Click "Reset migration test data" to clear mock test data

### What It Verifies

The test harness validates the complete migration safety pass flow:

1. **Mock Guest Data Seeding** — Seeds mock guest partitions with test data (tasks, habits, meals, budget, workouts, calendar)
2. **Mock Sync Queue Seeding** — Seeds mock guest sync queue items with pending operations
3. **Safety Pass Execution** — Runs the full `runGuestMigrationSafetyPass()` with test contexts
4. **Guest Source Partitions Exist** — Verifies guest source partitions still exist after safety pass
5. **Target Partitions Copied** — Verifies authenticated target partitions were copied
6. **Rollback Snapshot Created** — Verifies rollback snapshot metadata was created
7. **Sync Transfer Prepared** — Verifies sync queue transfer was prepared
8. **Orphan Tracking Record Exists** — Verifies orphaned guest tracking record exists
9. **Guest Data Untouched** — Confirms guest data remains untouched (no deletion)

### What It Intentionally Does NOT Test

- No destructive cleanup of guest partitions
- No sync queue replay
- No Supabase upload
- No automatic migration on login
- No production migration UI
- No analytics
- No notifications
- No social login

### Why Destructive Cleanup Is Deferred

Destructive cleanup is intentionally deferred to a future phase because:

1. **Safety First** — We must prove the safety pass works correctly before any deletion occurs
2. **Rollback Capability** — Guest partitions must remain available for rollback until rollback window expires
3. **User Control** — Users should have visibility into what will be deleted before deletion occurs
4. **Debugging** — Orphaned partitions provide debugging information for migration issues
5. **Recovery** — Preserves ability to recover from migration failures

### Test Data Rules

- Only runs in `__DEV__` mode
- Never runs automatically
- Never touches real active user partitions unless explicitly passed test context
- Uses deterministic test IDs (`test-guest-owner`, `test-cloud-owner`)
- Clears only mock test data when reset is clicked

### Test Harness API

```typescript
// Run the full test harness
runMigrationSafetyHarness()
  → Promise<MigrationHarnessResult>

// Reset the test harness state
resetMigrationSafetyHarness()
  → void

// Get the current test harness report
getMigrationSafetyHarnessReport()
  → MigrationHarnessReport | null

// Clear mock test data
clearMockMigrationTestData()
  → void

// Get test repository contexts
getMockMigrationContexts()
  → { guestContext, authenticatedContext }

// Verify mock data exists
verifyMockGuestDataExists()
  → boolean

verifyMockSyncQueueExists()
  → boolean
```

### Test Harness Report Structure

```typescript
interface MigrationHarnessReport {
  status: MigrationHarnessStatus;
  startedAt: string;
  completedAt: string | null;
  testContext: {
    localOwnerId: string;
    cloudOwnerId: string;
  };
  steps: MigrationHarnessStepResult[];
  safetyPassReport: GuestMigrationSafetyReport | null;
  validationResults: {
    guestSourcePartitionsExist: boolean;
    targetPartitionsCopied: boolean;
    rollbackSnapshotCreated: boolean;
    syncTransferPrepared: boolean;
    orphanTrackingRecordExists: boolean;
    guestDataUntouched: boolean;
  };
  error: string | null;
}
```

## Controlled Guest Cleanup (Phase 13.7)

### Purpose

Phase 13.7 implements controlled guest partition cleanup after migration safety has been proven. This phase is destructive-capable, but cleanup must never run automatically.

### Core Rule

```
migration ≠ cleanup
```

Migration copies and validates.
Cleanup removes old guest-owned leftovers only after safety gates pass.

### Cleanup Lifecycle

1. **Migration Completion** — Guest → account migration must complete successfully
2. **Validation Pass** — All validation checks must pass
3. **Rollback Window** — 7-day rollback window must expire
4. **Cleanup Preview** — Create preview of what will be deleted
5. **Confirmation Token** — Explicit confirmation token required
6. **Cleanup Execution** — Delete only verified cleanup candidates
7. **Completion** — Verify authenticated data preserved

### Cleanup Gates

Cleanup is blocked if any of these conditions are not met:

- **Migration Not Completed** — Migration safety pass must complete successfully
- **Validation Not Passed** — All validation checks must pass
- **Rollback Window Not Expired** — 7-day rollback window must expire
- **Pending Sync Transfer** — No pending sync transfer operations
- **Active Guest Ownership** — No active guest session ownership
- **Candidate Not Cleanup-Safe** — Candidate must be marked cleanup-safe
- **Missing Confirmation Token** — Explicit confirmation token required
- **Unknown Owner** — Owner must be known and verified
- **Storage Key Mismatch** — Storage keys must match expected pattern
- **Rollback Snapshot Missing** — Rollback snapshot must exist

### Confirmation Token Rule

Cleanup must only run when passed:

```ts
confirmationToken: "CONFIRM_GUEST_CLEANUP";
```

If missing or invalid, cleanup returns blocked result. No UI button should call cleanup without this token.

### Blocked Cleanup Examples

**Example 1: Rollback Window Not Expired**

```
Cleanup blocked: rollback_window_not_expired
Reason: Rollback window has not expired (3 days remaining)
```

**Example 2: Missing Confirmation Token**

```
Cleanup blocked: missing_confirmation_token
Reason: Missing or invalid confirmation token
```

**Example 3: Validation Not Passed**

```
Cleanup blocked: validation_not_passed
Reason: Migration validation did not pass
```

### Cleanup Behavior

**Delete Only:**

- Guest entity partitions already copied + validated
- Guest sync partitions already transferred/prepared
- Migration test partitions if explicitly marked test data
- Orphaned guest partitions marked cleanup eligible

**Never Delete:**

- Active guest session data
- Authenticated partitions
- Rollback snapshot until final cleanup completion
- Unrelated settings
- Global storage

### Fail-Closed Safety

If any check is ambiguous:

- Block cleanup
- Return reason
- Preserve all data

### Resumable Cleanup

Cleanup tracks:

- `cleanupId` — Unique cleanup identifier
- `startedAt` — Timestamp when cleanup started
- `completedAt` — Timestamp when cleanup completed
- `deletedKeys` — Keys successfully deleted
- `skippedKeys` — Keys skipped during cleanup
- `failedKeys` — Keys that failed to delete
- `currentStep` — Current step if paused
- `errors` — Errors encountered during cleanup

If cleanup fails midway:

- Do not retry automatically
- Expose `resumeGuestCleanup()` for manual resume
- Continue only from known safe candidates

### Rollback Metadata Rules

- Rollback snapshot preserved until final cleanup completion
- Rollback metadata deleted only after final confirmation
- Rollback capability remains available during cleanup window
- Rollback snapshot deletion is final step of cleanup

### Production UI Deferred

Production cleanup UI is intentionally deferred to a future phase because:

1. **Safety First** — Cleanup must be proven safe in development first
2. **User Control** — Users should have clear visibility into what will be deleted
3. **Confirmation** — Explicit confirmation should be required for destructive operations
4. **Recovery** — Users should have ability to cancel cleanup before completion
5. **Testing** — Development-only testing ensures safety before production exposure

### Cleanup API

```typescript
// Create cleanup preview
createCleanupPreview(localOwnerId)
  → GuestCleanupPreview

// Validate cleanup candidate
validateCleanupCandidate(candidate)
  → boolean

// Run controlled guest cleanup
runControlledGuestCleanup(localOwnerId, confirmationToken)
  → Promise<GuestCleanupResult>

// Resume interrupted cleanup
resumeGuestCleanup(cleanupId)
  → Promise<GuestCleanupResult>

// Get cleanup status
getCleanupStatus()
  → GuestCleanupState

// Reset cleanup status
resetCleanupStatus()
  → void
```

### Cleanup Test Harness

The test harness includes cleanup integration:

```typescript
// Run controlled cleanup test harness
runControlledCleanupHarness()
  → Promise<MigrationHarnessResult>

// Verify mock guest cleanup completed
verifyMockGuestCleanupCompleted()
  → boolean

// Verify authenticated data preserved
verifyAuthenticatedDataPreserved()
  → boolean
```

### Cleanup Types

```typescript
type GuestCleanupStatus =
  | "idle"
  | "previewing"
  | "awaiting_confirmation"
  | "deleting"
  | "paused"
  | "completed"
  | "failed"
  | "blocked";

type GuestCleanupBlockReason =
  | "migration_not_completed"
  | "validation_not_passed"
  | "rollback_window_not_expired"
  | "pending_sync_transfer"
  | "active_guest_ownership"
  | "candidate_not_cleanup_safe"
  | "missing_confirmation_token"
  | "unknown_owner"
  | "storage_key_mismatch"
  | "rollback_snapshot_missing";
```
