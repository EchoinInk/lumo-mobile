# Guest Migration Safety

## Phase 13.4 — Guest Account Migration Safety

Migration correctness phase focusing on migration safety before destructive cleanup. This phase implements safety and observability layers for guest → account migration without performing any destructive operations.

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

### Never

```
Direct Supabase calls from migration utilities
Automatic deletion of guest partitions
Global MMKV wipe
Sync queue replay
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
