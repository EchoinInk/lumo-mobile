# Auth Readiness Architecture

Phase 13.1 — Auth Readiness Architecture

This document describes the identity-safe architecture prepared for Supabase Auth integration. This phase is architecture-only and does not include actual Supabase wiring, polished auth UI, or destructive data migration.

## Overview

Lumo's auth readiness architecture ensures that Supabase Auth can be added cleanly later without rewriting stores, repositories, sync logic, or local persistence. The architecture maintains the existing local-first UX while preparing ownership boundaries for authenticated users.

## Core Principles

1. **UI never talks directly to Supabase** — Flow remains: Screen → Feature Hook → Repository → API Service
2. **Local-first UX is mandatory** — User actions remain instant and sync in the background
3. **Ownership is explicit** — Repositories receive ownership via RepositoryContext, never from global state
4. **Storage is partitioned** — Guest and authenticated user data are isolated
5. **Migration is safe** — Guest → account migration is planned and tracked before execution

## Ownership Model

### Guest Mode

- **localOwnerId**: Stable identifier generated on first app launch
- **cloudOwnerId**: Not present
- **Storage pattern**: `guest:{localOwnerId}:{entityName}`
- **Sync queue**: `guest:{localOwnerId}:syncQueue`
- **Behavior**: Local-only, no cloud sync

### Authenticated Mode

- **localOwnerId**: Preserved from guest mode (if migrated) or generated
- **cloudOwnerId**: Provided by Supabase Auth
- **Storage pattern**: `user:{cloudOwnerId}:{entityName}`
- **Sync queue**: `user:{cloudOwnerId}:syncQueue`
- **Behavior**: Local-first with background sync to Supabase

### Repository Context

All repositories should eventually receive `RepositoryContext` to establish ownership boundaries:

```typescript
interface RepositoryContext {
  accountMode: AccountMode;
  localOwnerId: LocalOwnerId;
  cloudOwnerId?: CloudOwnerId;
  storagePartitionKey: string;
  syncPartitionKey: string;
  isMigrating: boolean;
}
```

**Rules**:
- Repositories must never infer ownership from global state
- Ownership must always be passed through RepositoryContext
- Storage keys are derived from RepositoryContext
- Sync queue items carry ownership metadata at creation time

## Storage Partitioning

### Key Patterns

- **Guest entities**: `guest:{localOwnerId}:tasks`, `guest:{localOwnerId}:habits`
- **Authenticated entities**: `user:{cloudOwnerId}:tasks`, `user:{cloudOwnerId}:habits`
- **Guest sync queue**: `guest:{localOwnerId}:syncQueue`
- **Authenticated sync queue**: `user:{cloudOwnerId}:syncQueue`

### Isolation Guarantees

1. **Guest data never leaks into authenticated account data** — Different partition prefixes
2. **One authenticated user never sees another user's local cache** — cloudOwnerId is unique per account
3. **Sync queues are isolated per account** — Separate partition keys prevent cross-account sync

### Migration Key Mapping

During guest → account migration, keys are mapped:

```typescript
// Source (guest)
guest:abc123-def456:tasks → user:xyz789-ghi012:tasks (target)
guest:abc123-def456:syncQueue → user:xyz789-ghi012:syncQueue (target)
```

## Sync Queue Ownership

### Ownership Metadata

Each sync queue item carries ownership metadata at creation time:

```typescript
interface SyncQueueItem {
  ownerType: SyncOwnerType; // "guest" | "authenticated"
  localOwnerId: string;      // Always present
  cloudOwnerId?: string;     // Present only for authenticated items
  syncPartitionKey: string;  // Identifies queue partition
  createdDuringMigration?: boolean; // Tracks migration items
  // ... other fields
}
```

### Ownership Rules

1. **No sync item is processed without ownership metadata** — Required at creation time
2. **Guest sync items are never sent to Supabase** — ownerType prevents cloud sync
3. **Authenticated sync items may be sent to Supabase** — Future sync processor checks ownerType
4. **Migration sync items are identifiable** — createdDuringMigration flag for special handling

### Sync Queue Partitioning

- **Guest queue**: `guest:{localOwnerId}:syncQueue`
- **Authenticated queue**: `user:{cloudOwnerId}:syncQueue`

This ensures sync queues are never shared across accounts.

## Guest → Account Migration

### Migration Plan

The migration plan describes the data transfer:

```typescript
interface AccountMigrationPlan {
  sourceLocalOwnerId: LocalOwnerId;
  targetCloudOwnerId: CloudOwnerId;
  affectedStoragePartitions: string[];
  affectedSyncQueuePartitions: string[];
  entitiesToMigrate: string[];
  conflictStrategy: ConflictStrategy;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
}
```

### Migration Flow

1. **Create migration plan** — Identifies source, target, entities
2. **Validate migration plan** — Checks for conflicts, data integrity
3. **Mark migration started** — Sets startedAt timestamp
4. **Execute migration** — Moves data from guest to authenticated partitions (deferred)
5. **Mark migration complete** — Sets completedAt timestamp

### Conflict Strategies

- **guest_wins**: Keep guest data, discard any cloud data
- **cloud_wins**: Use cloud data, discard guest data
- **merge**: Attempt to merge both datasets
- **manual**: Require user to resolve conflicts

### What Phase 13.1 Does NOT Do

- Does not perform destructive migration
- Does not delete guest data
- Does not actually move data between partitions
- Does not resolve conflicts
- This phase prepares the migration architecture only

## Auth Guards

### Guard Modes

- **requireGuest**: Allow only guest users
- **requireAuthenticated**: Allow only authenticated users
- **allowGuest**: Allow both guest and authenticated users
- **allowDuringMigration**: Allow access during guest → account migration

### Usage

```typescript
// Component guard
<AuthGuard mode="requireAuthenticated">
  <ProtectedFeature />
</AuthGuard>

// Hook guard
const { canAccess, isLoading } = useAuthGuard("requireAuthenticated");
```

### Fallback Behavior

- Shows loading state while session hydrates
- Shows calm fallback using existing EmptyState component when access denied
- No polished auth screens in this phase

## Repository Identity Boundary Example

### Tasks Feature Reference Implementation

The tasks feature demonstrates the RepositoryContext pattern:

**Before** (legacy):
```typescript
// Repository uses fixed storage key
private readonly STORAGE_KEY = StorageKeys.TASKS;
```

**After** (with RepositoryContext):
```typescript
// Repository respects ownership context
private repositoryContext?: RepositoryContext;

setRepositoryContext(context: RepositoryContext): void {
  this.repositoryContext = context;
}

private getStorageKey(): string {
  if (this.repositoryContext) {
    return getEntityStorageKey("tasks", this.repositoryContext);
  }
  return this.STORAGE_KEY; // Fallback to legacy key
}
```

**Benefits**:
- Gradual migration without breaking existing code
- Legacy code continues to work with StorageKeys.TASKS
- New code can pass RepositoryContext for partitioned storage
- No breaking changes to existing task behavior

## Architecture Decisions

### 1. Separate Auth Session Store

**Decision**: Created `useAuthSessionStore` separate from existing `useAuthStore`

**Rationale**:
- Existing `useAuthStore` has Supabase-specific types
- New store focuses on ownership identity (guest vs authenticated)
- Allows gradual migration without breaking existing auth logic
- Avoids circular dependencies between auth types

### 2. RepositoryContext Instead of Global State

**Decision**: Repositories receive ownership via RepositoryContext, not global state

**Rationale**:
- Explicit ownership prevents implicit dependencies
- Easier to test repositories with different contexts
- Clear ownership audit trail
- Supports migration scenarios where context changes

### 3. Storage Partitioning by Owner

**Decision**: Storage keys include owner ID in the key itself

**Rationale**:
- Prevents data leakage between users
- No need for runtime ownership checks on read
- Simple to understand and debug
- Works with MMKV's key-value model

### 4. Sync Queue Ownership at Creation Time

**Decision**: Sync items carry ownership metadata stamped at creation

**Rationale**:
- Ownership never inferred at sync time
- Clear audit trail for each sync operation
- Prevents accidental cross-account sync
- Supports migration tracking

### 5. Non-Destructive Migration Planning

**Decision**: Migration plan is created and validated before execution

**Rationale**:
- Users can review what will be migrated
- Conflicts can be identified before data loss
- Migration can be cancelled safely
- Supports manual conflict resolution

## Files Created

### Auth Types
- `src/features/auth/types/auth.types.ts` — Canonical identity types

### Auth Store
- `src/features/auth/store/useAuthSessionStore.ts` — Auth session store shell

### Repository Context
- `src/services/repositories/repositoryContext.ts` — Repository context provider

### Storage Partitioning
- `src/services/storage/storagePartition.ts` — Storage partition helpers

### Sync Queue Ownership
- `src/services/storage/queue.types.ts` — Updated with ownership metadata

### Migration Planning
- `src/features/auth/services/accountMigrationPlan.ts` — Migration plan utilities

### Auth Guards
- `src/features/auth/components/AuthGuard.tsx` — Auth guard component
- `src/features/auth/hooks/useAuthGuard.ts` — Auth guard hook

## Files Modified

### Tasks Feature (Reference Implementation)
- `src/features/tasks/services/taskLocalRepository.ts` — Added RepositoryContext support

### Sync Queue Types
- `src/services/storage/queue.types.ts` — Added ownership metadata to SyncQueueItem

## Deferred Work

### Not Implemented in Phase 13.1

1. **Supabase Auth wiring** — No actual Supabase integration
2. **Polished auth UI** — No login/signup screens
3. **Social login** — No OAuth providers
4. **Onboarding rewrite** — Existing onboarding unchanged
5. **Analytics integration** — No analytics in this phase
6. **Push notifications** — No push notification setup
7. **Destructive migration execution** — Migration plan only, no data movement
8. **Conflict resolution** — Strategy placeholder only
9. **Full repository migration** — Only tasks as reference implementation
10. **Guest data deletion** — No cleanup after migration

### Recommended Next Phases

1. **Phase 13.2** — Wire Supabase Auth, implement real login/logout
2. **Phase 13.3** — Build polished auth UI (login/signup screens)
3. **Phase 13.4** — Implement destructive guest → account migration
4. **Phase 13.5** — Migrate all features to RepositoryContext pattern
5. **Phase 13.6** — Add social login providers
6. **Phase 13.7** — Integrate analytics with auth
7. **Phase 13.8** — Add push notifications with auth

## Verification

### Type Checking

Run:
```bash
npm run typecheck
```

Expected: TypeScript passes with no errors

### Linting

Run:
```bash
npm run lint
```

Expected: Linting passes with no errors

### Manual Verification

Confirm:
- [x] App still starts
- [x] No auth UI was introduced
- [x] No Supabase auth was wired yet
- [x] Repositories remain local-first
- [x] Task behavior still works
- [x] Storage keys are ownership-safe where implemented
- [x] Sync queue types can carry ownership metadata

## Risks and Mitigations

### Risk: Breaking Existing Auth Logic

**Mitigation**: Created separate `useAuthSessionStore` to avoid conflicts with existing `useAuthStore`. Existing auth logic remains untouched.

### Risk: Storage Key Conflicts

**Mitigation**: Used distinct prefixes (`guest:` vs `user:`) to prevent key collisions. Legacy keys (e.g., `tasks`) still work for backward compatibility.

### Risk: Repository Context Not Passed

**Mitigation**: Repositories fall back to legacy storage keys when RepositoryContext is not provided. This allows gradual migration.

### Risk: Sync Queue Compatibility

**Mitigation**: Added ownership fields as optional where possible. Existing sync queue code continues to work with null values.

### Risk: Migration Data Loss

**Mitigation**: Migration is non-destructive in this phase. No data is actually moved or deleted. Migration plan is validated before execution.

## Summary

Phase 13.1 establishes a clean, identity-safe architecture for Supabase Auth integration. The architecture:

- Maintains existing local-first UX
- Provides explicit ownership boundaries
- Supports safe guest → account migration
- Allows gradual migration without breaking changes
- Prepares storage partitioning and sync queue ownership

The architecture is ready for Supabase Auth wiring in a future phase without requiring rewrites of stores, repositories, sync logic, or local persistence.
