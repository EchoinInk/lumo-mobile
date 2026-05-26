# Changelog

## Phase 13.6 — Migration Safety Test Harness

### Overview

Phase 13.6 builds a development-only test harness to prove the guest → account migration safety pass works with disposable local data before destructive cleanup is introduced. This phase is testing + verification only.

### Core Principles

- Testing + verification only
- No automatic deletion
- No silent destructive migration
- No sync replay
- No Supabase upload
- No automatic migration on login
- Explicit method calls only for safety pass
- Only runs in **DEV** mode

### Files Created

**Test Harness Types**

- `src/features/auth/types/migrationTest.types.ts` — Test harness types (MigrationHarnessStatus, MigrationHarnessReport, MigrationHarnessStepResult, MigrationHarnessResult)

**Test Data Utilities**

- `src/features/auth/testing/migrationTestData.ts` — Mock guest data seeding utilities:
  - `seedMockGuestMigrationData()` — Seeds mock guest partitions with test data
  - `seedMockGuestSyncQueue()` — Seeds mock guest sync queue items
  - `clearMockMigrationTestData()` — Clears mock test data
  - `getMockMigrationContexts()` — Gets test repository contexts
  - `verifyMockGuestDataExists()` — Verifies mock guest data exists
  - `verifyMockSyncQueueExists()` — Verifies mock sync queue exists

**Test Harness Service**

- `src/features/auth/testing/migrationSafetyHarness.ts` — Test harness orchestration:
  - `runMigrationSafetyHarness()` — Runs full test harness with validation
  - `resetMigrationSafetyHarness()` — Resets test harness state
  - `getMigrationSafetyHarnessReport()` — Gets current test harness report

### Files Modified

**Account Screen**

- `app/(tabs)/more/account.tsx` — Added dev-only test harness controls:
  - "Run migration safety test" button
  - "Reset migration test data" button
  - Harness result display
  - Only visible in **DEV** mode
  - Does not run on mount
  - Does not use real user data

### Test Harness Flow

1. **Seed Guest Data** — Seeds mock guest partitions with test data (tasks, habits, meals, budget, workouts, calendar)
2. **Seed Guest Sync Queue** — Seeds mock guest sync queue items with pending operations
3. **Create Test Contexts** — Creates guest and authenticated repository contexts with deterministic test IDs
4. **Run Safety Pass** — Calls `runGuestMigrationSafetyPass()` with test contexts
5. **Validate Results** — Verifies:
   - Guest source partitions still exist
   - Target partitions were copied
   - Rollback snapshot was created
   - Sync transfer was prepared
   - Orphan tracking record exists
   - Guest data is untouched
6. **Return Report** — Returns structured test report with validation results

### Test Data Rules

- Only runs in **DEV** mode
- Never runs automatically
- Never touches real active user partitions unless explicitly passed test context
- Uses deterministic test IDs (`test-guest-owner`, `test-cloud-owner`)
- Clears only mock test data when reset is clicked

### What Phase 13.6 Does NOT Do

- No automatic deletion
- No silent destructive migration
- No sync replay
- No Supabase upload
- No automatic migration on login
- No production migration UI
- No analytics
- No notifications
- No social login
- No destructive cleanup

### Verification

- TypeScript passes with no errors ✓
- Web app boots successfully on http://localhost:8081 ✓
- No import.meta error ✓
- Account route does not spin forever ✓
- Login/signup routes still render ✓
- Guest mode still works ✓
- Migration utilities do not run on startup ✓
- No guest data is deleted ✓
- No sync queue replay occurs ✓
- No Supabase upload occurs ✓
- Missing Supabase env vars still fail open to guest mode ✓
- Dev-only harness controls show only in **DEV** ✓
- Running harness completes without deletion ✓
- Mock guest data remains after safety pass ✓
- Target authenticated partitions are copied ✓
- Rollback snapshot is created ✓
- Sync queue transfer is prepared ✓
- Orphan tracking record exists ✓
- Reset clears only mock test data ✓

### Risks

1. **Guest Data Orphaning** — Logout generates new localOwnerId, orphaning old guest data. Cleanup needed in future phase.
2. **Migration Record Loss** — If MMKV is cleared, migration tracking records are lost. Future phases should add backup to secure storage.
3. **Rollback Window** — 7-day rollback window may be too short for some users. Future phases should make this configurable.
4. **Partition Discovery** — Current implementation relies on migration tracking records for partition discovery. Future phases should add fallback discovery methods.

### Recommended Phase 13.7

Destructive Guest Partition Cleanup (only after validation passes):

- Implement actual guest partition deletion after rollback window expires
- Add user confirmation for cleanup
- Add cleanup progress tracking
- Add cleanup error recovery
- Delete orphaned guest partitions after validation passes

## Phase 13.5 — Migration Safety Real Implementation Wiring

### Overview

Phase 13.5 wires the real migration utility implementations into the guest migration orchestrator, replacing stubbed placeholder logic with actual calls to preview, conflict, copy, validation, rollback, sync transfer, and orphaned tracking utilities.

### Core Principles

- Preserve all safety guarantees from Phase 13.4
- No automatic deletion
- No silent destructive migration
- No sync replay
- No Supabase upload
- No automatic migration on login
- Explicit method calls only for safety pass

### Files Modified

**Guest Migration Orchestrator**

- `src/features/auth/services/guestMigrationOrchestrator.ts` — Wired real implementations:
  - `generateMigrationPreview()` from `migrationPreview.ts`
  - `detectConflicts()` and `resolveAllConflicts()` from `migrationConflictStrategy.ts`
  - `copyGuestToAuthenticated()` from `migrationCopy.ts`
  - `validateMigrationCopy()` from `migrationValidation.ts`
  - `createRollbackSnapshot()` from `migrationRollback.ts`
  - `createSyncQueueTransferPreview()` and `prepareSyncQueueTransfer()` from `migrationSyncQueueTransfer.ts`
  - `discoverGuestPartitions()` from `migrationOrphanedGuestTracking.ts`

### Implementation Details

**Safety Pass Flow (Now Real)**

1. **Previewing** — Calls `generateMigrationPreview()` to scan guest partitions and calculate migration size/complexity
2. **Checking Conflicts** — Calls `detectConflicts()` and `resolveAllConflicts()` with "overwrite" strategy
3. **Copying** — Calls `copyGuestToAuthenticated()` to copy guest partitions to authenticated partitions
4. **Validating** — Calls `validateMigrationCopy()` to validate copied data integrity
5. **Preparing Rollback** — Calls `createRollbackSnapshot()` to create rollback snapshot metadata
6. **Preparing Sync Transfer** — Calls `createSyncQueueTransferPreview()` and `prepareSyncQueueTransfer()` to prepare sync queue for ownership transfer
7. **Tracking Orphaned Guest** — Calls `discoverGuestPartitions()` to track migrated guest partitions
8. **Completed** — Safety pass complete with real results

### Safety Guarantees Preserved

- If any step fails, stop immediately
- Rollback metadata preserved if already created
- Source guest data remains untouched
- Target authenticated data not corrupted
- Sync queue never replayed
- Migration does NOT run automatically on login
- Explicit method calls only

### What Phase 13.5 Does NOT Do

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
- No polished migration UI
- No destructive cleanup
- No sync queue replay

### Verification

- TypeScript passes with no errors ✓
- Web app boots successfully on http://localhost:8081 ✓
- No import.meta error ✓
- Account route does not spin forever ✓
- Login/signup routes still render ✓
- Guest mode still works ✓
- Migration utilities do not run on startup ✓
- No guest data is deleted ✓
- No sync queue replay occurs ✓
- No Supabase upload occurs ✓
- Missing Supabase env vars still fail open to guest mode ✓

### Risks

1. **Guest Data Orphaning** — Logout generates new localOwnerId, orphaning old guest data. Cleanup needed in Phase 13.6.
2. **Migration Record Loss** — If MMKV is cleared, migration tracking records are lost. Future phases should add backup to secure storage.
3. **Rollback Window** — 7-day rollback window may be too short for some users. Future phases should make this configurable.
4. **Partition Discovery** — Current implementation relies on migration tracking records for partition discovery. Future phases should add fallback discovery methods.

### Recommended Phase 13.6

Destructive Guest Partition Cleanup (only after validation passes):

- Implement actual guest partition deletion after rollback window expires
- Add user confirmation for cleanup
- Add cleanup progress tracking
- Add cleanup error recovery
- Delete orphaned guest partitions after validation passes

## Phase 13.4 — Guest Account Migration Safety Integration

### Overview

Migration correctness phase focusing on migration safety before destructive cleanup. Phase 13.4 integrates existing migration safety utilities into a coherent orchestration flow with types, hooks, and auth transition integration.

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

### Files Created

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

### Files Modified

**Auth Transition Orchestrator**

- `src/features/auth/services/authTransitionOrchestrator.ts` — Added `prepareGuestUpgradeSafety()` and `completeGuestUpgradeSafety()` methods for explicit migration safety pass execution

**Account Screen**

- `app/(tabs)/more/account.tsx` — Added debug-only migration diagnostics section (shows account mode, owner IDs, migration status, rollback availability, cleanup eligibility)

**Storage Imports**

- Fixed TypeScript errors in 8 migration service files by changing imports from `storage` (not exported) to `storageInstance` (exported)

### Architecture

**Orchestration Flow**

The guest migration orchestrator integrates all safety utilities into a deterministic safety pass:

1. **Previewing** — Scan guest partitions and calculate migration size/complexity
2. **Checking Conflicts** — Identify potential conflicts (skipped in current implementation)
3. **Copying** — Copy guest partitions to authenticated partitions
4. **Validating** — Validate copied data integrity
5. **Preparing Rollback** — Create rollback snapshot metadata
6. **Preparing Sync Transfer** — Prepare sync queue for ownership transfer
7. **Tracking Orphaned Guest** — Track migrated guest partitions
8. **Completed** — Safety pass complete

**Safety Pass Lifecycle**

```
Idle → Previewing → Checking Conflicts → Copying → Validating → Preparing Rollback → Preparing Sync Transfer → Tracking Orphaned Guest → Completed
                                    ↓
                                 Failed
```

**Failure Behavior**

If any step fails:

- Stop immediately
- Preserve rollback metadata if already created
- Source guest data remains untouched
- Target authenticated data not corrupted
- Error message captured in report
- Failure reason recorded
- Rollback remains available if snapshot exists

### Safety Guarantees

- If any step fails, stop safely
- Rollback metadata must remain available
- Source guest data must remain untouched
- Target authenticated data must not be corrupted
- Sync queue must not be replayed
- Migration does NOT run automatically on login
- Explicit method calls only for migration safety pass

### What Phase 13.4 Does NOT Do

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
- No polished migration UI
- No destructive cleanup
- No sync queue replay

### Verification

- TypeScript passes with no errors
- Web app boots successfully
- No import.meta error
- Account route does not spin forever
- Login/signup routes still render
- Guest mode still works
- Migration utilities do not run on startup
- No guest data is deleted
- No sync queue replay occurs
- No Supabase upload occurs
- Missing Supabase env vars still fail open to guest mode

### Risks

1. **Guest Data Orphaning** — Logout generates new localOwnerId, orphaning old guest data. Cleanup needed in Phase 13.6.
2. **Migration Record Loss** — If MMKV is cleared, migration tracking records are lost. Future phases should add backup to secure storage.
3. **Rollback Window** — 7-day rollback window may be too short for some users. Future phases should make this configurable.
4. **Partition Discovery** — Current implementation relies on migration tracking records for partition discovery. Future phases should add fallback discovery methods.

### Deferred Work

Recommended next phases:

- Phase 13.5 — Integrate migration utilities with actual copy/validation/rollback implementations (currently stubbed)
- Phase 13.6 — Destructive Guest Partition Cleanup (only after validation passes)
- Phase 13.7 — Migration Backup to Secure Storage
- Phase 13.8 — Configurable Rollback Window

## Phase 13.3 — Minimal Auth Screens + Guarded Entry

### Overview

UI-only phase adding minimal login/signup screens, guarded account route, and logout flow on top of Phase 13.2 auth infrastructure. This phase proves the auth flow works without overbuilding auth UX.

### Core Principles

- Screens remain thin and minimal
- Auth logic lives in hooks/services, not screens
- Calm, non-alarming feedback states
- Guest mode preserved
- Local-first behavior preserved
- No onboarding rewrites
- No destructive guest → account migration

### Files Created

**Auth Routes**

- `src/app/auth/_layout.tsx` — Auth stack layout
- `src/app/auth/login.tsx` — Login screen with email/password form
- `src/app/auth/signup.tsx` — Signup screen with email/password form

**Account Route**

- `app/(tabs)/more/account.tsx` — Guarded account screen with logout

**Auth Hook**

- `src/features/auth/hooks/useAuthForm.ts` — Auth form state management (email, password, validation, error normalization)

**Documentation**

- `docs/minimal-auth-screens.md` — Auth screens architecture documentation

### Files Modified

**Auth Service**

- `src/services/api/auth/supabaseAuth.session.ts` — Added `signInWithEmailPassword`, `signUpWithEmailPassword` methods
- `src/services/api/auth/index.ts` — Re-exported new auth methods

**More Screen**

- `app/(tabs)/more/index.tsx` — Added account/sign-in entry with conditional icon (LogIn for guest, User for authenticated)

### Architecture Decisions

1. **Thin Screens** — Auth screens are minimal, using existing UI primitives (Screen, Input, Button, Text)
2. **Auth Form Hook** — Form state and validation isolated in `useAuthForm` hook, not in screens
3. **Error Normalization** — Supabase errors normalized into calm user-facing messages
4. **Guarded Account** — Account screen uses `AuthGuard` with `requireAuthenticated` mode and calm fallback
5. **Logout Flow** — Logout uses transition orchestrator, signs out from Supabase and session store, preserves guest mode
6. **More Screen Entry** — Account entry conditionally shows "Sign in" or "Account" based on auth state

### Auth Flow

**Login Flow:**

- User enters email/password → `useAuthForm.signIn()` → `signInWithEmailPassword()` → Supabase auth → On success: beginGuestUpgrade → setAuthenticatedSession → finalizeGuestUpgrade → Navigate to account

**Signup Flow:**

- User enters email/password → `useAuthForm.signUp()` → `signUpWithEmailPassword()` → Supabase auth → On success: beginGuestUpgrade → setAuthenticatedSession → finalizeGuestUpgrade → Navigate to account

**Logout Flow:**

- User taps sign out → beginLogoutTransition → signOutSession → signOut → finalizeLogoutTransition → Navigate back to More

### Feedback States

- **Loading:** Button shows ActivityIndicator when submitting
- **Invalid Form:** Error message below form fields, red border on error
- **Auth Error:** Calm error message (e.g., "We couldn't sign you in. Please check your email and password.")
- **Logged-Out Fallback:** Calm message with login/signup actions

### What Phase 13.3 Does NOT Do

- No social login
- No analytics
- No push notifications
- No onboarding redesign
- No polished marketing auth screens
- No destructive guest → account migration
- No Supabase calls in screens
- No giant auth store
- No auth UI owning persistence
- No profile editing
- No complex account settings

### Verification

- TypeScript passes with no errors
- App boots successfully
- Guest mode still works
- Login screen renders
- Signup screen renders
- Account screen is guarded
- Logout returns to guest mode
- Screens do not import Supabase SDK
- Repositories do not import Supabase SDK
- Auth UI does not delete guest data
- More screen entry works

### Deferred Work

Recommended next phases:

- Phase 13.4 — Implement destructive guest → account migration
- Phase 13.5 — Migrate all features to RepositoryContext pattern
- Phase 13.6 — Add social login providers
- Phase 13.7 — Integrate analytics with auth
- Phase 13.8 — Add push notifications with auth

## Phase 13.2 — Supabase Auth Integration Core

### Overview

Infrastructure-first phase implementing actual auth/session infrastructure using Supabase Auth without introducing auth debt, UI coupling, or breaking local-first behavior. This phase wires Supabase Auth into Lumo while preserving the architecture established in Phase 13.1.

### Core Principles

- UI never talks directly to Supabase — Flow remains: Screen → Feature Hook → Repository → API Service
- Local-first UX is mandatory — User actions remain instant and sync in the background
- Ownership is explicit — Repositories receive ownership via RepositoryContext, never from global state
- Storage is partitioned — Guest and authenticated user data are isolated
- Migration is safe — Guest → account migration is planned and tracked before execution
- Offline-safe behavior — App remains usable offline, expired sessions gracefully fallback

### Files Created

**Auth Layer (src/services/api/auth/)**

- `supabaseAuth.types.ts` — Internal Supabase auth types (SupabaseAuthSession, SupabaseAuthError, SupabaseAuthResult)
- `supabaseAuth.client.ts` — Supabase client initialization with SecureStore persistence adapter
- `supabaseAuth.session.ts` — Session management (getCurrentSession, refreshSession, signOutSession, restorePersistedSession, subscribeToAuthChanges)
- `supabaseAuth.mapper.ts` — Type mapping (Supabase → canonical types: mapSupabaseUserToAuthUser, mapSupabaseSessionToRepositoryContext)
- `auth.config.ts` — Environment validation (getSupabaseConfig, isSupabaseConfigured, EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
- `index.ts` — Public API exports

**Auth Services (src/features/auth/services/)**

- `authTransitionOrchestrator.ts` — Transition coordination (beginGuestUpgrade, finalizeGuestUpgrade, beginLogoutTransition, finalizeLogoutTransition)

**Auth Hooks (src/features/auth/hooks/)**

- `useSessionBootstrap.ts` — Offline-safe session restoration (useSessionBootstrap, useSessionReady, useSessionRestoring, useSessionError)

**Auth Utils (src/features/auth/utils/)**

- `authDiagnostics.ts` — Development-only state validation (validateOwnershipConsistency, validateStoragePartitionConsistency, validateRepositoryContextIntegrity, validateMigrationState, detectOrphanedSyncQueueOwnership)

**Sync Ownership (src/services/sync/ownership/)**

- `syncOwnership.ts` — Sync queue ownership validation and enforcement (validateSyncOwnership, assertSyncOwnership, syncItemBelongsToContext, isSyncItemEligibleForUpload, filterUploadEligibleItems)

**Storage Isolation (src/services/storage/)**

- `storageIsolation.ts` — Auth-aware storage clearing utilities (clearGuestPartitions, clearAuthenticatedPartitions, clearSyncPartitions, clearOwnershipScopedData, clearCloudOwnerDataPreserveGuest)

**Documentation**

- `docs/supabase-auth-core-architecture.md` — Comprehensive auth architecture documentation

### Files Modified

**Auth Store (src/features/auth/store/)**

- `useAuthSessionStore.ts` — Added session lifecycle methods (hydrateSession, restoreSession, signOut, setSessionHydrating, setSessionReady, setSessionError), added auth state (authUser, lastSessionRestoreAt, authHydrationStatus, authError)

**Repository Context (src/services/repositories/)**

- `repositoryContext.ts` — Added authenticated context factories (createRepositoryContextFromSession, createRepositoryContextFromAuthUser)

**Sync Queue Compatibility (Phase 13.1 cleanup)**

- `src/features/tasks/services/taskSyncRepository.ts` — Updated to use new ownership metadata with TODOs for Phase 13.2
- `src/services/storage/syncQueue.ts` — Updated recordQueueItem to use new ownership fields
- `src/services/sync/deadLetter/index.ts` — Added compatibility layer for userId migration
- `src/services/sync/queue/queue.validation.ts` — Updated validation with ownership metadata
- `src/services/sync/testing/index.ts` — Updated test utilities to use new ownership fields

### Architecture Decisions

1. **Separate Auth Layer** — Supabase code isolated in `src/services/api/auth/` to prevent direct imports from UI
2. **Type Mapping** — Supabase types mapped immediately to canonical types to maintain single source of truth
3. **SecureStore Persistence** — Supabase tokens stored in SecureStore for security
4. **Offline-First Session Restoration** — App remains usable offline, expired sessions gracefully fallback
5. **Explicit Repository Context** — Repositories receive ownership via context, never from global state
6. **Sync Ownership Enforcement** — Guest sync items never upload, migration items pause safely
7. **Storage Isolation** — Deterministic partition clearing using known keys, no global MMKV wipe
8. **Transition Orchestrator** — Centralized transition coordination to prevent ownership corruption

### Storage Key Patterns

- **Guest entities**: `guest:{localOwnerId}:tasks`, `guest:{localOwnerId}:habits`, `guest:{localOwnerId}:meals`, `guest:{localOwnerId}:budget`, `guest:{localOwnerId}:workouts`, `guest:{localOwnerId}:calendar`
- **Authenticated entities**: `user:{cloudOwnerId}:tasks`, `user:{cloudOwnerId}:habits`, `user:{cloudOwnerId}:meals`, `user:{cloudOwnerId}:budget`, `user:{cloudOwnerId}:workouts`, `user:{cloudOwnerId}:calendar`
- **Guest sync queue**: `guest:{localOwnerId}:syncQueue`
- **Authenticated sync queue**: `user:{cloudOwnerId}:syncQueue`
- **Migration metadata**: `guest:{localOwnerId}:migration`, `user:{cloudOwnerId}:migration`

### What Phase 13.2 Does NOT Do

- No polished auth UI (login/signup screens)
- No social login providers
- No onboarding rewrite
- No analytics integration
- No push notification setup
- No destructive migration execution
- No guest data deletion
- No conflict resolution
- No full repository migration (only tasks as reference)
- No automatic sync replay

### Verification

- TypeScript passes with no errors
- App boots successfully
- Offline launch still works
- Guest mode still works
- No auth UI exists yet
- No repositories directly use Supabase SDK
- No screens directly use Supabase SDK
- Ownership metadata survives hydration
- Storage partitions remain isolated
- Logout does not corrupt local data
- Sync queue respects ownership rules

### Deferred Work

Recommended next phases:

- Phase 13.3 — Build polished auth UI (login/signup screens)
- Phase 13.4 — Implement destructive guest → account migration
- Phase 13.5 — Migrate all features to RepositoryContext pattern
- Phase 13.6 — Add social login providers
- Phase 13.7 — Integrate analytics with auth
- Phase 13.8 — Add push notifications with auth

## Phase 13.1 — Auth Readiness Architecture

### Overview

Architecture-only phase preparing Lumo for Supabase Auth integration without rewriting stores, repositories, sync logic, or local persistence. This phase establishes identity-safe ownership boundaries for guest and authenticated users.

### Core Principles

- UI never talks directly to Supabase — Flow remains: Screen → Feature Hook → Repository → API Service
- Local-first UX is mandatory — User actions remain instant and sync in the background
- Ownership is explicit — Repositories receive ownership via RepositoryContext, never from global state
- Storage is partitioned — Guest and authenticated user data are isolated
- Migration is safe — Guest → account migration is planned and tracked before execution

### Files Created

**Auth Types**

- `src/features/auth/types/auth.types.ts` — Canonical identity types (AccountMode, UserIdentity, RepositoryContext, AccountMigrationPlan)

**Auth Store**

- `src/features/auth/store/useAuthSessionStore.ts` — Auth session store shell with MMKV persistence (accountMode, localOwnerId, cloudOwnerId, sessionStatus, transitionStatus)

**Repository Context**

- `src/services/repositories/repositoryContext.ts` — Repository context provider (getRepositoryContext, createGuestRepositoryContext, createAuthenticatedRepositoryContext, assertRepositoryContext)

**Storage Partitioning**

- `src/services/storage/storagePartition.ts` — Storage partition helpers (getStoragePartitionKey, getEntityStorageKey, getSyncQueueStorageKey, getMigrationStorageKey, validation utilities)

**Sync Queue Ownership**

- `src/services/storage/queue.types.ts` — Updated with ownership metadata (ownerType, localOwnerId, cloudOwnerId, syncPartitionKey, createdDuringMigration)

**Migration Planning**

- `src/features/auth/services/accountMigrationPlan.ts` — Migration plan utilities (createAccountMigrationPlan, validateAccountMigrationPlan, markMigrationStarted, markMigrationComplete)

**Auth Guards**

- `src/features/auth/components/AuthGuard.tsx` — Auth guard component (requireGuest, requireAuthenticated, allowGuest, allowDuringMigration modes)
- `src/features/auth/hooks/useAuthGuard.ts` — Auth guard hook for programmatic access control

### Files Modified

**Tasks Feature (Reference Implementation)**

- `src/features/tasks/services/taskLocalRepository.ts` — Added RepositoryContext support with setRepositoryContext() method and partitioned storage keys

**Sync Queue Types**

- `src/services/storage/queue.types.ts` — Added SyncOwnerType, updated SyncQueueItem and CreateQueueItemInput with ownership metadata

### Architecture Decisions

1. **Separate Auth Session Store** — Created `useAuthSessionStore` separate from existing `useAuthStore` to avoid conflicts and allow gradual migration
2. **RepositoryContext Instead of Global State** — Repositories receive ownership via RepositoryContext for explicit dependencies and easier testing
3. **Storage Partitioning by Owner** — Storage keys include owner ID to prevent data leakage between users
4. **Sync Queue Ownership at Creation Time** — Sync items carry ownership metadata stamped at creation for clear audit trail
5. **Non-Destructive Migration Planning** — Migration plan is created and validated before execution to prevent data loss

### Storage Key Patterns

- **Guest entities**: `guest:{localOwnerId}:tasks`, `guest:{localOwnerId}:habits`
- **Authenticated entities**: `user:{cloudOwnerId}:tasks`, `user:{cloudOwnerId}:habits`
- **Guest sync queue**: `guest:{localOwnerId}:syncQueue`
- **Authenticated sync queue**: `user:{cloudOwnerId}:syncQueue`

### What Phase 13.1 Does NOT Do

- No Supabase Auth wiring
- No polished auth UI (login/signup screens)
- No social login providers
- No onboarding rewrite
- No analytics integration
- No push notification setup
- No destructive migration execution
- No conflict resolution
- No full repository migration (only tasks as reference)
- No guest data deletion

### Verification

- TypeScript passes with no errors
- App still starts
- No auth UI introduced
- No Supabase auth wired yet
- Repositories remain local-first
- Task behavior still works
- Storage keys are ownership-safe where implemented
- Sync queue types can carry ownership metadata

### Deferred Work

Recommended next phases:

- Phase 13.2 — Wire Supabase Auth, implement real login/logout
- Phase 13.3 — Build polished auth UI (login/signup screens)
- Phase 13.4 — Implement destructive guest → account migration
- Phase 13.5 — Migrate all features to RepositoryContext pattern
- Phase 13.6 — Add social login providers
- Phase 13.7 — Integrate analytics with auth
- Phase 13.8 — Add push notifications with auth

## Phase 12.3 — Production QA + Regression Pass

### QA Audits Completed

- **Navigation Audit**:
  - Onboarding redirects verified (first-run flow works correctly)
  - Tab navigation verified (all 5 tabs accessible)
  - Nested More routes hidden from tab bar (href: null)
  - No duplicate headers (headerShown: false on all layouts)
  - No "(tabs)" title regression
  - Back navigation consistent across nested routes

- **Hydration Audit**:
  - Onboarding persistence verified (useOnboardingStore with MMKV)
  - Tasks persistence verified (useTaskStore with error handling)
  - Habits persistence verified (useHabitStore with streak logic)
  - Settings persistence verified (useSettingsStore with new accessibility settings)

- **Feedback States Audit**:
  - Loading states: Tasks, Health, Habits all use LoadingState
  - Empty states: Dashboard, Tasks, Habits have appropriate empty handling
  - Retry states: Tasks uses RetryView with calm error messaging
  - Error boundary: Wrapped root layout, calm fallback UI with retry button

- **Accessibility Audit**:
  - Tab buttons: All have tabBarAccessibilityLabel
  - Task actions: Complete, edit, delete have accessibility labels
  - Habit actions: Add FAB has accessibility label
  - Onboarding actions: Continue/Back buttons have accessibility labels
  - Settings toggles: All switches have accessibilityLabel and accessibilityRole="switch"
  - Touch targets: Maintained at 44px minimum
  - Reduced motion: useReducedMotion hook combines system + user preference
  - Typography: Uses React Native defaults for dynamic font scaling

### Added

- **QA Utilities** (`src/utils/dev/`):
  - `triggerTestError.ts` — Development utility for triggering test errors to verify ErrorBoundary
  - `qaChecks.ts` — Development utility for running basic QA checks on app state
  - Both utilities only run in `__DEV__` mode, no production analytics

### Design Verification

- Calm, low-stimulation UX maintained
- Predictable interactions preserved
- Accessible touch targets maintained (44px minimum)
- Token-backed design system consistent
- No noisy motion or animation-heavy transitions
- Spacing rhythm consistent (using Spacing tokens)
- Section padding consistent (Spacing.xl between sections)

### Technical

- Preserved local-first architecture
- Screen → Hook → Store → Repository → Storage flow maintained
- No backend, Supabase, auth, analytics, notifications, or React Query added
- TypeScript passes with no errors
- No regressions found in navigation, hydration, or feedback states

### Remaining Known Issues

- None identified during this QA pass

## Phase 12.2 — Accessibility + Reduced Motion Settings

### Added

- **Accessibility Settings** (`src/store/useSettingsStore.ts`):
  - `reducedMotion` — user preference for reduced motion
  - `simplifiedMode` — foundation for simplified UI mode
  - Settings persist via MMKV storage

- **useReducedMotion Hook** (`src/hooks/useReducedMotion.ts`):
  - Combines system reduce-motion preference with user setting
  - Returns single boolean for animation control
  - Safe for future animation systems

- **useSimplifiedMode Hook** (`src/hooks/useSimplifiedMode.ts`):
  - Foundation hook for simplified UI mode
  - Returns boolean indicating simplified mode state
  - Ready for future UI simplification

- **Accessibility Section in Settings** (`app/(tabs)/more/settings.tsx`):
  - Reduced Motion toggle
  - Haptics toggle
  - Simplified Mode toggle
  - All toggles wired to settings store
  - Accessibility labels on all switches

### Accessibility Improvements

- **Tab Buttons** (`app/(tabs)/_layout.tsx`):
  - Added `tabBarAccessibilityLabel` to all tabs (Dashboard, Tasks, Calendar, Health, More)

- **Task Actions** (`app/(tabs)/tasks.tsx`):
  - Task complete: `accessibilityLabel` with status and title
  - Edit button: `accessibilityLabel` with task title
  - Delete button: `accessibilityLabel` with task title
  - Add FAB: `accessibilityLabel` for "Add new task"

- **Habit Actions** (`app/(tabs)/more/habits.tsx`):
  - Add FAB: `accessibilityLabel` for "Add new habit"

- **Onboarding Actions** (`src/features/onboarding/components/OnboardingShell.tsx`):
  - Continue button: `accessibilityLabel` with next label
  - Back button: `accessibilityLabel` for "Go back"
  - ChoiceChip: `accessibilityLabel` with option label, `accessibilityState` for selected/disabled

- **Settings Toggles** (`app/(tabs)/more/settings.tsx`):
  - All switches: `accessibilityLabel` with setting name
  - `accessibilityRole="switch"` for proper screen reader behavior

### Design

- Calm, low-stimulation UX
- Predictable interactions
- Accessible touch targets maintained
- Token-backed design system
- No noisy motion or animation-heavy transitions

### Technical

- Preserved local-first architecture
- Screen → Hook → Store → Repository → Storage flow maintained
- No backend, Supabase, auth, analytics, notifications, or React Query added
- Typography already supports dynamic font scaling (uses `allowFontScaling` defaults)

## Phase 12.1 — Production Hardening Foundation

### Added

- **Shared Feedback Components** (`src/components/feedback/`):
  - `ErrorState.tsx` — gentle error display with soft UI
  - `EmptyState.tsx` — calm empty states with reassuring messages
  - `LoadingState.tsx` — quiet loading indicator for hydration
  - `RetryView.tsx` — graceful retry UI with "try again when you're ready" copy
  - `OfflineView.tsx` — offline state with reassurance that data is safe
  - `ErrorBoundary.tsx` — class component catching render crashes

- **Root Error Boundary Integration** (`app/_layout.tsx`):
  - Wrapped root layout with ErrorBoundary
  - Preserved onboarding redirect behavior
  - Maintained first-run routing
  - No navigation regressions

- **Calm Empty States** (`src/constants/feedbackMessages.ts`):
  - Added `EMPTY_MESSAGES` for various contexts (tasks, habits, meals, budget, dashboard)
  - Gentle, non-judgmental language ("Nothing here right now", "This space is calm and waiting")
  - `getEmptyMessage()` helper for consistent messaging

- **Standardized Loading States**:
  - Dashboard: Uses LoadingState during onboarding hydration
  - Tasks: Added loading and error states with RetryView
  - Health: Added LoadingState for habit hydration
  - More/Habits: Added LoadingState for habit hydration

### Design

- Calm, spacious, soft UI
- Token-backed using existing theme
- Non-alarming language
- No harsh reds, no stack traces
- Low cognitive load design
- Accessible

### Technical

- ErrorBoundary uses `console.warn` only (no analytics, no Sentry)
- Preserved local-first architecture
- Screen → Hook → Store → Repository → Storage flow maintained
- No backend dependencies added

## Phase 11.9 — Onboarding Foundation

### Added

- **Onboarding Flow** (`app/onboarding/`):
  - Step 1: "What feels hardest right now?" — struggle areas selection
  - Step 2: "How do you prefer to plan?" — planning style selection
  - Step 3: "What should Lumo help with first?" — focus areas selection
  - Complete: "Your space is ready" — welcome screen with "Enter Lumo" CTA

- **Onboarding Types** (`src/features/onboarding/types/onboarding.ts`):
  - `StruggleArea` — remembering tasks, building routines, meal planning, budgeting, staying consistent, feeling overwhelmed
  - `PlanningStyle` — minimal, visual, structured, flexible
  - `FocusArea` — tasks, habits, meals, wellness, fitness, budget
  - `OnboardingPreferences` — stores user selections
  - Display labels for all options

- **Onboarding Store** (`src/features/onboarding/store/useOnboardingStore.ts`):
  - MMKV-based persistence via `StorageKeys.ONBOARDING`
  - `hydrate()` — loads saved preferences on app start
  - `setStruggleAreas()`, `setPlanningStyle()`, `setFocusAreas()` — update preferences
  - `completeOnboarding()` — marks onboarding complete with timestamp
  - `resetOnboarding()` — clears preferences for testing

- **Onboarding Hook** (`src/features/onboarding/hooks/useOnboarding.ts`):
  - Auto-hydrates on mount
  - Exposes all state and actions
  - Clean API for components

- **Onboarding UI Components**:
  - `OnboardingShell` — consistent layout with gradient background, progress, title, footer actions
  - `ChoiceChip` — selectable chips for options with checkmark indicator
  - `OnboardingProgress` — step indicator bar

- **First-Run Routing** (`app/_layout.tsx`):
  - Waits for onboarding hydration
  - Redirects new users to `/onboarding`
  - Redirects returning users to `/(tabs)`
  - Prevents flashing wrong screen

- **Settings Integration** (`app/(tabs)/more/settings.tsx`):
  - Added "Testing" section with "Reset Onboarding" action
  - Confirmation dialog before reset
  - Routes to onboarding after reset

- **Feature Exports** (`src/features/onboarding/index.ts`):
  - Centralized exports for types, store, hook, and components

### Technical

- Self-contained in `src/features/onboarding`
- Local storage only — no backend
- No new dependencies
- Preserves local-first architecture boundaries

## Phase 11.8 — Dashboard Personalization + Empty States

### Added

- **Dashboard Data Composition** (`app/(tabs)/index.tsx`):
  - Integrated `useTasks()` and `useHabits()` for real local data
  - Dashboard now shows Today’s Focus from real tasks
  - Dashboard now shows Today’s Routines from real habits
  - Combined daily progress (tasks + habits) with adaptive messaging

- **Dashboard Components**:
  - `DailyProgressCard` — shows combined task + habit completion with supportive labels
  - `TodayFocusCard` — lists today's priority tasks with toggle completion
  - `TodaysRoutinesCard` — lists today's habits with streak badges
  - Updated `QuickActions` with working navigation routes

- **Dashboard Utils** (`src/features/dashboard/utils/dashboardProgress.ts`):
  - `calculateDailyProgress()` — combines task and habit completion stats
  - `getSupportiveLabel()` — returns calm, non-punitive messages based on progress:
    - 0 items: "A quiet day is still a valid day."
    - 1-49%: "You've started. That counts."
    - 50-99%: "You're making steady progress."
    - 100%: "Today's essentials are complete."

- **Calm Empty States**:
  - "Nothing urgent here." (no tasks)
  - "You can add one small step when you're ready." (empty tasks)
  - "A gentle routine can help anchor the day." (no habits)
  - "Today is a blank canvas. Add what feels right." (no data at all)

- **Quick Actions** (now functional):
  - Add Task → navigates to Tasks tab
  - Add Habit → navigates to More/Habits
  - Calendar → navigates to Calendar tab
  - More → navigates to More tab

### Technical

- All data flows through existing local-first architecture
- No backend changes, no new dependencies
- Components remain presentational; data logic in hooks
- TypeScript passes

## Phase 11.7 — Real Habits Flow

### Added

- **Habit Types** (`src/features/habits/types/habit.ts`):
  - `Habit` interface with id, title, description, frequency, targetDays, streakCount, completedDates, color, icon, timestamps
  - `CreateHabitInput` and `UpdateHabitInput` for create/edit operations
  - Support for daily and weekly habits
  - Soft delete with `deletedAt` for sync compatibility

- **Habit Local Repository** (`src/features/habits/services/habitLocalRepository.ts`):
  - `getHabits()`, `getHabitById(id)`, `createHabit(input)`, `updateHabit(id, updates)`
  - `deleteHabit(id)` with soft delete, `hardDeleteHabit(id)`
  - `completeHabit(id, date)` and `uncompleteHabit(id, date)` for daily tracking
  - Automatic streak calculation based on completion history
  - MMKV persistence through `StorageKeys.HABITS`

- **Habit Store** (`src/features/habits/store/useHabitStore.ts`):
  - Zustand store with `habits`, `isHydrated`, `isLoading`, `error` state
  - Actions: `hydrate()`, `addHabit()`, `updateHabit()`, `deleteHabit()`, `completeHabit()`, `uncompleteHabit()`, `clearError()`
  - Background persistence to MMKV

- **Habit Hook** (`src/features/habits/hooks/useHabits.ts`):
  - Exposes: `habits`, `todayHabits`, `completedToday`, `pendingToday`
  - Stats: `completionRate`, `totalStreak`, `bestStreak`
  - Actions with error handling: `addHabit`, `updateHabit`, `deleteHabit`, `toggleHabit`, `isCompletedToday`
  - Automatic hydration on mount

- **HabitFormModal** (`src/features/habits/components/HabitFormModal.tsx`):
  - Calm rounded modal/sheet with keyboard handling
  - Create: "Add a gentle routine" / Edit: "Edit routine"
  - Title input (required), description (optional)
  - Frequency chips: Daily, Weekly
  - Target day chips for weekly habits (Mon-Sun)
  - Color picker with 7 calm color options
  - Gradient primary button, quiet "Not now" cancel button

- **HabitListItem** (`src/features/habits/components/HabitListItem.tsx`):
  - Shows habit title, description preview (1 line)
  - Frequency badge with target days for weekly habits
  - Streak count with flame icon when > 0
  - Soft completion checkbox with habit color accent
  - Edit (pencil) and Delete (trash) action buttons
  - No harsh red UI

- **Health Screen Integration** (`app/(tabs)/health.tsx`):
  - Replaced mock habits with real habit data
  - Shows today's habits count, completed count, completion progress bar
  - Lists today's habits with toggle, edit, delete
  - Add habit button with gradient
  - Empty state: "No habits yet" with supportive copy
  - Modal for adding/editing habits

- **More/Habits Screen** (`app/(tabs)/more/habits.tsx`):
  - Full dedicated habits screen with stats summary
  - Shows completed count, best streak, success rate
  - Lists all today's habits with full actions
  - Add habit button and modal
  - Empty state with supportive copy

### Technical

- All persistence flows through `HabitLocalRepository` → MMKV
- Soft delete pattern for future sync support
- Streak calculation based on consecutive completion days
- Weekly habits filter by target days for today's view
- TypeScript passes, no new dependencies

## Phase 11.6 — Task Editing + Due Dates

### Added

- **Reusable TaskFormModal**:
  - Unified modal for both creating and editing tasks
  - `mode: "create" | "edit"` prop switches behavior
  - `initialTask` prop pre-populates form in edit mode
  - Calm, spacious UI with keyboard handling

- **Task Editing Flow**:
  - Pencil icon on each task row for editing
  - Edit mode pre-fills title, notes, priority, due date/time
  - Save changes persists through repository
  - Cancel safely returns without changes

- **Due Date & Time Support**:
  - Task types updated: `dueDate?: string` and `dueTime?: string`
  - Simple chip-based date selection: Today, Tomorrow, No date
  - Optional time input with text field
  - Due info displays as "Today", "Tomorrow", or formatted date

- **Enhanced Task List Display**:
  - Notes preview shown when available (1 line truncation)
  - Due date/time badge with "Today"/"Tomorrow" smart labels
  - Edit + Delete action buttons side by side

- **Improved Filtering**:
  - "Today" filter: incomplete tasks due today or without due date
  - "Upcoming" filter: incomplete tasks due tomorrow or later
  - "Done" filter: completed tasks

- **Dashboard Prioritization**:
  - Today&apos;s Focus now prioritizes tasks by:
    1. Incomplete high priority tasks due today
    2. Other incomplete tasks due today
    3. Overdue tasks
    4. Newest incomplete tasks by creation date

- **Calm Empty States**:
  - Supportive copy that avoids guilt-driven language
  - Context-aware messages per filter tab
  - "No tasks for today" / "No upcoming tasks" / "No completed tasks yet"

### Technical

- Persistence preserved: all edits flow through `TaskLocalRepository` → MMKV
- No backend changes, no Supabase, no new dependencies
- TypeScript passes, all types updated

## Phase 11.5 — Local Persistence Hardening

### Verified

- **MMKV Persistence**: Tasks are stored under `StorageKeys.TASKS` with proper serialization
- **Hydration**: `useTasks` hook automatically hydrates from MMKV on first mount
- **Repository Pattern**: All CRUD operations go through `TaskLocalRepository`
  - `createTask()` → persists to MMKV
  - `toggleTask()` → persists to MMKV
  - `updateTask()` → persists to MMKV
  - `deleteTask()` → soft delete with `deletedAt` timestamp
- **Error Handling**: Repository errors are normalized, UI shows calm error messages
- **Graceful Degradation**: Corrupted storage returns empty array instead of crashing

### Added

- **useTasks Hook Hardening**:
  - Added `isLoading` state (true while hydrating)
  - Added `error` state with calm, supportive messages
  - Added `clearError()` action
  - Wrapped all actions with try/catch error handling
  - Added persistence verification comments

- **Delete Support**:
  - Subtle trash icon on each task row
  - Calm, non-destructive UI (muted gray color)
  - Soft delete (task persists in storage with `deletedAt` flag)
  - Accessibility labels for screen readers

### Architecture Preserved

- UI → Hook → Store → Repository → Storage boundaries maintained
- Local-first: All changes persist immediately to MMKV
- No backend dependencies
- No React Query
- Thin screens, rich hooks

---

## Phase 11.4 — Real Add Task Flow

### Added

- **AddTaskModal** (`src/features/tasks/components/AddTaskModal.tsx`): Calm modal for adding tasks
  - Title: "Add a small step" with supportive subtitle
  - Task title input (required)
  - Optional notes field
  - Priority selector with calm pill buttons (Low/Medium/High)
  - Primary gradient "Add task" button
  - Secondary "Not now" cancel button
  - Keyboard avoiding view for smooth UX
  - Accessible labels and roles throughout

- **Tasks Screen Integration**: Connected Tasks screen to real task state
  - Add Task button opens AddTaskModal
  - Task list displays real tasks from useTasks hook
  - Checkboxes toggle task completion
  - Priority badges shown (colored dot + label)
  - Completed tasks visually softened
  - Filter pills work with real data (All/Today/Upcoming/Done)

- **Dashboard Integration**: Today's Focus card now shows real tasks
  - First 4 tasks from task store displayed
  - High priority tasks highlighted with pink border
  - Checkboxes functional (toggle completion)
  - Fallback to mock data if no tasks exist
  - Progress bar reflects real completion count

- **Task Feature Index** (`src/features/tasks/index.ts`): Clean barrel exports for components, hooks, types, and store

### Architecture

- Local-first architecture preserved (MMKV persistence)
- UI → Hook → Store → Repository pattern maintained
- Thin screens, rich components
- No global store — task-specific state only
- Instant UI updates, background persistence
- Type-safe throughout

---

## Phase 11.3 — Visual QA + App Polish

### Polished

- **Mobile Viewport**: Updated Screen component with proper bottom padding for tab bar visibility, safe area handling for iOS/Android
- **Tab Bar**: Soft, calm styling with no border, gentle active/inactive colors, larger touch targets (44x44+), subtle icon sizing on focus
- **Screen Component**: Added `bottomPadding` prop for automatic tab bar spacing, improved ScrollView content container padding
- **Card Component**: Added `overflow: hidden` for clean rounded corners, improved gradient layout, better accessibility roles
- **SectionHeader**: Improved spacing with larger margins, cleaner typography hierarchy
- **Dashboard**: Verified mockup alignment — greeting, Today's Focus with checkboxes, Quick Actions grid, "You did this" progress card, reminder card, encouragement quote
- **Tasks**: Verified soft pill filters, calm checkboxes (32x32 touch targets), readable task rows, gentle "Break tasks down" support card, prominent but calm Add Task button
- **Calendar**: Verified aligned date strip, clear timeline spacing, soft pastel highlighting, encouraging copy
- **Health**: Verified card-based summaries, consistent progress bars, supportive copy, quick links to detailed screens
- **More Screen**: Feature grid with consistent cards, soft navigation
- **More Nested Screens**: All use MoreScreenHeader with soft rounded back button, consistent styling, proper bottom padding

### Design System

- All screens use token-backed styling (Colors, Spacing, Radius, Shadows)
- Touch targets meet 44x44 minimum accessibility requirement
- Text contrast verified for readability
- Consistent soft white/lavender background throughout
- Gentle pastel accent colors (pink, purple, blue)
- Large rounded corners (28px radius on cards) for premium feel
- Soft cinematic purple-tinted shadows

### Accessibility

- Minimum 44x44 touch targets on all interactive elements
- Proper text contrast ratios
- Screen reader support with accessibility labels
- Reduced motion support in components
- Clear visual hierarchy with soft color transitions

---

## Phase 11.2 — Screen System + Visual Product Recovery

### Added

- **Theme Updates**: Soft white/lavender backgrounds, pastel accent colors, calm blue/pink/purple gradients
- **Updated Shadow Tokens**: Cinematic purple-tinted shadows for premium feel
- **Updated Radius Tokens**: Large rounded cards up to 40px radius for gentle aesthetic
- **BottomTabAddButton Component**: Circular pink-purple gradient Add button for center tab
- **Tab Layout**: 5 tabs (Start, Dashboard, Add, Calendar, More) with proper icons
- **Start Screen**: Greeting card, Today's Focus, Quick Actions, Progress card, Reminder card
- **Dashboard Screen**: At-a-glance stats, weekly overview, small wins, encouragement card
- **Calendar Screen**: Weekly date strip, day schedule, highlighted appointments
- **More Screen**: Feature grid with cards linking to nested screens
- **Nested Screens**: Budget Tracker, Payment Logs, Weekly Groceries, My Meals, Cleaning Schedule, Weight Loss Tracker, My Workout Log, Settings, About
- **Modal Infrastructure**: Add-modal screen for quick actions
- **Reusable UI Components**: StatCard, QuickActionCard, ProgressBar, SectionHeader

### Design Philosophy

- **Soft & Gentle**: No harsh edges, spacious layouts, low cognitive load
- **Neurodivergent-Friendly**: Supportive copy, minimal distractions, clear navigation
- **Premium Aesthetic**: Soft gradients, cinematic shadows, rounded corners throughout
- **Consistent Navigation**: Clear bottom tabs with center Add button

### UX Principles

- Thin screens that compose feature components
- Token-backed styling, no hardcoded values
- Mock data only, no Supabase connections
- Icon consistency with lucide-react-native

## Phase 11.2B — Core Tab Screens + Mockup Alignment

### Changed

- **Tab Layout Restructure**: Changed from 5 tabs (Start/Dashboard/Add/Calendar/More) to 4 primary tabs:
  - Dashboard (index.tsx) - Main home/overview
  - Tasks - Task list with filters
  - Calendar - Schedule with date strip
  - Health - Wellness overview with summaries
  - More - Feature grid linking to nested screens

### Updated Screens

- **Dashboard (index.tsx)**: Greeting header, Today's Focus card with checkboxes, Quick Actions grid, "You did this!" progress card, Reminder card, supportive encouragement quote
- **Tasks (tasks.tsx)**: Segmented filters (All/Today/Upcoming/Done), task list with calm checkboxes, time labels, priority/focus tags, "Break tasks down" support card, gradient Add Task button
- **Calendar (calendar.tsx)**: Compact month/week header, horizontal date strip, day schedule timeline, highlighted active event, encouragement card (polished existing)
- **Health (health.tsx)**: Habits summary with streak, Calories summary with progress, Weight summary with change indicator, Workout summary, quick links to health-related More screens, encouragement card

### Design Alignment

- All screens now match the Lumo mockup aesthetic
- Soft white/lavender backgrounds throughout
- Calm blue/pink/purple gradient accents
- Rounded cards with soft shadows
- Spacious, low-density layouts
- Neurodivergent-friendly supportive copy
- Premium pastel planner aesthetic
- Minimal but clear lucide-react-native icons
- Consistent bottom tab navigation

## Phase 12 — Production Hardening

### Added

- **Error System** (src/services/error/): errorLogger.ts for calm error logging, errorClassifier.ts for intelligent error categorization, errorRecovery.ts for graceful recovery with exponential backoff
- **Analytics Services** (src/services/analytics/): analyticsService.ts for lightweight event tracking, analyticsEvents.ts for typed event definitions, analyticsQueue.ts for offline-safe event batching
- **Feedback Components** (src/components/feedback/): ErrorState, ErrorBoundary, RetryView, OfflineView, EmptyState, LoadingState, SuccessState, SkeletonCard for calm, emotionally safe UX states
- **Resilience Hooks** (src/hooks/): useRetry for patient retry logic, useOfflineState for offline awareness, useAsyncBoundary for async error handling
- **Analytics Feature** (src/features/analytics/): useAnalyticsStore for analytics preferences, analyticsFeatureService for feature-level tracking, analyticsHelpers for utility functions
- **Error Type Definitions** (src/types/errors.ts): AppError, ErrorLog, ErrorClassification, ErrorRecoveryOptions, ErrorBoundaryState
- **Analytics Type Definitions** (src/types/analytics.ts): AnalyticsEvent, AnalyticsEventPayload, AnalyticsQueueEntry, AnalyticsConfig, AnalyticsSession
- **Feedback Constants** (src/constants/emptyStates.ts): Emotionally intelligent empty state messages for all features
- **Feedback Message Constants** (src/constants/feedbackMessages.ts): Calm error, success, loading, retry, and offline messages

### Error Philosophy

- **Emotionally Safe**: Errors feel reassuring, not alarming
- **No Technical Jargon**: "Something didn't work" instead of "Fatal exception"
- **Forgiving**: Users are never punished for failures
- **Calm Recovery**: Gentle retry with exponential backoff, no aggressive loops
- **Graceful Degradation**: Offline states feel safe, expected, non-destructive

### Error Classification

- **Network Errors**: Connection issues with retry support
- **Storage Errors**: Data persistence problems with fallback
- **Auth Errors**: Authentication failures with reset strategy
- **Validation Errors**: Input validation with ignore strategy
- **Sync Errors**: Sync failures with retry and local safety
- **Unknown Errors**: Fallback to calm general messaging

### Empty State Philosophy

- **Supportive Tone**: "A gentle place to begin" instead of "You haven't completed anything yet"
- **Lightweight Encouragement**: No pressure, no gamification
- **Clear Next Action**: Always provide a path forward
- **Calm Composition**: Spacious, breathable, not overwhelming

### Loading State Philosophy

- **Skeleton Placeholders**: Preserved layout stability
- **Soft Transitions**: No flashing, no layout jumps
- **Avoid Spinner Overload**: Contextual loading only
- **Predictable Rendering**: Consistent patterns across features

### Retry Architecture

- **Exponential Backoff**: Calm delay progression (1s, 2s, 4s)
- **Max Retries**: 3 attempts by default, configurable
- **Offline Awareness**: Respects network state
- **Safe Cancellation**: Can be cancelled without side effects
- **Progress Feedback**: Shows attempt count without pressure

### Offline UX Philosophy

- **Safe Messaging**: "Changes will sync when you're back online" instead of "Connection lost"
- **Expected Behavior**: Offline feels normal, not exceptional
- **Non-Destructive**: Emphasizes data safety
- **Retry Awareness**: Clear when sync will happen
- **Degraded Gracefully**: Features work when possible

### Analytics Philosophy

- **Behavioral Insight**: Track task completion, onboarding drop-off, feature adoption
- **NOT Surveillance**: No personal behavioral profiling, no session reconstruction
- **Opt-Out Support**: Users can disable analytics anytime
- **Offline-Safe**: Queue events locally, flush when online
- **Lightweight Payloads**: Minimal data, no bloat
- **Batched Delivery**: Efficient event flushing

### Analytics Architecture

- **Feature → Analytics Service → Queue → Provider**: Clean abstraction, no vendor lock-in
- **Event Batching**: 10 events per batch, configurable
- **Flush Interval**: 30 seconds, configurable
- **Queue Persistence**: MMKV storage, survives app restarts
- **Max Queue Size**: 100 events, FIFO eviction
- **Typed Events**: Full TypeScript coverage

### Error Boundaries

- **Screen-Level Boundaries**: Graceful fallback per screen
- **Safe Logging Hooks**: Errors logged without exposing stack traces
- **Retry Support**: Users can retry failed screens
- **Error Classification**: Different recovery strategies per error type
- **No App Crashes**: Errors contained, never crash entire app tree

### Accessibility + Feedback

- **Reduced Motion**: All feedback components respect reduced motion
- **Dynamic Font Sizing**: Text scales with system preferences
- **Calm Contrast**: No flashing error states, no jittery loaders
- **Predictable Layouts**: Stable feedback states, no layout jumps
- **Touch Targets**: 44x44 minimum for all interactive elements

### Performance Requirements

- **Lightweight Feedback**: Minimal component overhead
- **No Rerender Storms**: Memoized where appropriate
- **Layout Stability**: Skeletons preserve structure
- **Minimal Animation**: Subtle motion only, reduced motion support
- **Efficient Queuing**: Analytics batching prevents spam

### Design Language

- **Soft & Spacious**: Calm spacing, not cluttered
- **Emotionally Calm**: No alarming reds everywhere
- **Restrained Blur**: Subtle depth, not overwhelming
- **Supportive Copy**: Warm, reassuring language
- **Intentional States**: Every state has purpose and clarity

## Phase 11 — Advanced UX Layer

### Added

- **Animation Primitives** (src/animations/): Reusable animation system with transitions, presets, haptics, motion utilities, and reduced motion support
- **Animated Components** (src/components/animated/): FadeIn, ScalePress, AnimatedCard, SharedTransitionCard, and CelebrationPulse components with calm, subtle animations
- **Onboarding Components** (src/components/onboarding/): OnboardingContainer, OnboardingProgress, FocusSelectionCard, PreferenceSelector, and WelcomeHero components for calm, emotionally intelligent onboarding
- **Onboarding Feature Architecture** (src/features/onboarding/): Complete onboarding flow with hooks (useOnboardingFlow, useOnboardingValidation), screens (OnboardingScreen), and utilities
- **Onboarding Services** (src/services/onboarding/): onboardingService.ts and dashboardPersonalization.ts for onboarding logic and dashboard personalization
- **Onboarding Store** (src/store/useOnboardingStore.ts): Zustand store for onboarding state and progress with MMKV persistence
- **Accessibility Store** (src/store/useAccessibilityStore.ts): Zustand store for accessibility preferences including reduced motion, haptic feedback, and visual preferences
- **Type Definitions** (src/types/onboarding.ts, src/types/accessibility.ts): Complete type definitions for onboarding data, personalization, and accessibility preferences
- **Onboarding Constants** (src/constants/onboarding.ts): Centralized configuration for onboarding flow, options, and personalization defaults

### Motion Philosophy

- All animations are subtle, calm, and respect reduced motion preferences
- Motion reduces friction and improves clarity, never competes for attention
- Haptic feedback is used sparingly and intentionally (selection, completion, onboarding progression)
- Blur effects used minimally for overlays and depth without readability loss
- No flashy, hyperactive, or dopamine-driven animations

### Onboarding Flow

- **Step 1**: "What do you struggle with most?" — Multi-select struggle areas (tasks, routines, meals, overwhelm, budgeting, consistency)
- **Step 2**: "How do you prefer planning?" — Single-select planning preference (minimal, visual, structured, flexible)
- **Step 3**: "Choose your focus areas" — Multi-select focus areas (habits, tasks, meals, wellness, fitness)
- Onboarding choices drive dashboard personalization (feature visibility, density, card style)
- Calm, reassuring, emotionally safe onboarding experience

### Accessibility

- Reduced motion support integrated across all animations
- Haptic feedback can be disabled via accessibility preferences
- Animation intensity scaling (none, reduced, normal)
- Motion priority system (essential vs optional animations)
- All animations respect system and app-level accessibility preferences automatically

### Dependencies

- `react-native-reanimated` — Animation library
- `expo-haptics` — Haptic feedback
- `expo-blur` — Blur effects for depth

### Architecture

- Feature-first onboarding architecture with hooks, screens, services, and utilities
- Modular animation primitives that can be composed across the app
- Centralized motion configuration in src/animations/motion.ts
- Reduced motion utilities in src/animations/reducedMotion.ts
- Haptic utilities in src/animations/haptics.ts with intensity control
- Onboarding persistence via MMKV through Zustand persist middleware
- Dashboard personalization generated from onboarding choices

### UX Tone

- Emotional intelligence and safety prioritized over gamification
- Calm, breathable, supportive interactions
- No achievement pressure, streak obsession, or urgency
- Subtle delight through gentle motion and warm haptics
- Reduced overwhelm through personalized first-run experience

## Phase 9 — Backend & Sync Architecture

### Added

- **Supabase Infrastructure**: Typed Supabase client with `expo-secure-store` session persistence, URL polyfill, and environment variable configuration
- **Authentication Foundation**: Auth service, auth store (Zustand), auth types, session restoration, hydration handling — supports sign in, sign up, sign out, and session restore
- **Offline-First Sync Queue**: MMKV-persisted operation queue with create/update/delete support, retry tracking, failure handling, and queue persistence across app restarts
- **Sync Processor**: Background queue processor that auto-triggers on connectivity change, processes entries sequentially with retry logic, and supports per-entity-type handler registration
- **Sync-Aware Repository**: `TaskSyncRepository` wrapping local repository with optimistic writes — updates MMKV instantly, enqueues sync operation, triggers background sync
- **Network Awareness**: `NetInfo`-based connectivity utilities with online/offline detection, reactive listeners, sync gating, and `waitForOnline()` helper
- **Retry Utility**: Exponential backoff with jitter for resilient network operations, configurable max attempts, delay, and retry callbacks
- **Secure Storage Adapter**: `expo-secure-store` wrapper with web fallback, providing Supabase-compatible storage interface for auth token persistence
- **Auth Hook** (`useAuth`): Thin hook exposing auth state and actions to screens
- **Sync Status Hook** (`useSyncStatus`): Hook for UI components to display sync state, pending count, and connectivity
- **App Initialization Module** (`services/init.ts`): Bootstrap sequence for network monitoring, sync processor, and auth session restoration
- **Environment Setup**: `.env.example` with Supabase configuration, `.env` added to `.gitignore`
- **Setup Documentation**: `docs/backend-setup.md` covering architecture, data flow, file structure, extension guide, and security notes

### Dependencies

- `@supabase/supabase-js` — Supabase client SDK
- `expo-secure-store` — Native keychain/keystore token storage
- `react-native-url-polyfill` — URL API polyfill for React Native
- `@react-native-community/netinfo` — Network connectivity detection
- `zustand` — State management (now in package.json)
- `react-native-mmkv` — MMKV storage (now in package.json)

### Architecture

- Repository pattern enforced: UI → Hook → Repository → API Service → Supabase
- Local-first writes with optimistic updates — user interactions never block on network
- Sync queue persists in MMKV, survives app restarts, processes when online
- Sync handlers registered per entity type — extensible to habits, meals, budget
- Auth tokens secured via `expo-secure-store` (native) with `localStorage` web fallback
- Repository factory (`services/repositories/index.ts`) swaps between sync and local implementations
- Storage keys centralized in `services/storage/storageKeys.ts`

### Changed

- Updated `tsconfig.json` with `baseUrl` and `paths` for `@/` alias resolution
- Updated `app/_layout.tsx` to call `initializeBackend()` on mount
- Updated repository factory to use `taskSyncRepository` as default
- Updated `.gitignore` to exclude `.env` files

### Notes

- No auth screens implemented — this phase is infrastructure only
- No React Query — sync is handled via queue + processor pattern
- Supabase client gracefully warns if env vars are missing (app still runs locally)
- Sync processor is a scaffold — entity handlers registered as features connect to backend
- All code is strongly typed with no `any` usage

---

## Phase 8 — Performance Architecture

### Added

- FlashList infrastructure with AppFlashList wrapper component
- Reusable list primitives (ListEmptyState, ListLoadingState, ListSeparator, MemoizedListItem)
- Memoization utilities (useStableCallback, useMemoizedValue, useListOptimization hooks)
- Optimized task list architecture using AppFlashList
- Performance hooks for stable callbacks and list optimization
- Rendering guidelines documentation (docs/performance-guidelines.md)

### Improved

- Scalable rendering architecture with FlashList standardization
- Virtualization defaults with estimatedItemSize and removeClippedSubviews
- List rendering stability through memoized components and stable callbacks
- Screen composition standards with thin orchestration pattern
- TaskRow component with React.memo and custom comparison function

### Fixed

- Excessive inline callback rendering risks through useStableCallback
- Potential large-list re-render bottlenecks with FlashList virtualization
- Oversized screen component structures through component extraction

## [SWE-1.6] - UX & Accessibility Foundation

### Added

- UX constraint system (src/constants/ux.ts) with token-backed values for touch targets, animation durations, spacing rhythm, content constraints, hierarchy depth, card density, form constraints, reduced motion defaults, interaction timing, focus behavior, and typography constraints
- Accessibility utility helpers (src/utils/accessibility.ts) with functions for touch target sizing, accessible labels, semantic roles, reduced motion detection, screen reader detection, accessibility props creation, font scaling, focus management, announcements, animation duration handling, press state styling, label validation, heading structure, and platform-specific adjustments
- Motion token system (src/theme/motion.ts) with duration values, easing curves, reduced motion variants, scale values, opacity values, and transition priorities
- Reduced motion hook (src/hooks/useReducedMotion.ts) for detecting and responding to system reduced motion preferences
- Form UX primitives (src/components/forms/FormSection.tsx, FormField.tsx) with accessible form section wrapper and accessible text input with error states
- Neurodivergent UX guidelines (docs/UX_GUIDELINES.md) documenting spacing rules, interaction rules, accessibility standards, motion rules, hierarchy rules, form design standards, dashboard density rules, and navigation simplicity rules

### Updated

- Screen component (src/components/ui/Screen.tsx) with centered variant, keyboardShouldPersistTaps, accessibility props, content width constraint from UX tokens, and improved accessibility behavior
- Button component (src/components/ui/Button.tsx) with accessibilityRole, accessibilityLabel and accessibilityHint support, reduced motion support, minimum 44x44 touch targets for all sizes, improved pressed states, proper accessibility state for disabled and loading states, and accessible loading indicator
- Card component (src/components/ui/Card.tsx) with new interactive and compact variants, accessibility labels, reduced motion support, improved press states, and accessibilityRole for pressable cards

### Accessibility

- Minimum 44x44 touch targets enforced across all interactive components
- Semantic accessibility roles (button, header, text, adjustable) implemented
- Reduced motion handling integrated with useReducedMotion hook and motion token system
- Predictable focus behavior with keyboardShouldPersistTaps and logical focus order
- Improved screen reader support with proper accessibilityLabel, accessibilityHint, and accessibilityState props
- Accessible form components with clear labels, error states, and keyboard behavior
- Focus ring styling defined in UX constraints for clear visual feedback

### Architecture

- All UX values are token-backed using existing design token system
- Accessibility helpers provide reusable utilities for consistent implementation
- Motion system prioritizes state clarity (P0) over delight (P1)
- Form components follow neurodivergent-first principles with calm spacing and clear hierarchy
- Reduced motion support is integrated at the component level with hook-based detection

## [Phase 6] - Local-First Data Architecture

### Added

- Repository pattern with shared contracts (IRepository.ts)
- Task repository interface (ITaskRepository)
- MMKV storage layer with proper initialization (mmkv.ts)
- Task local repository with MMKV persistence (taskLocalRepository.ts)
- Feature-level task Zustand store with repository integration
- Task hooks for UI integration (useTasks.ts)
- Task utility helpers (taskHelpers.ts)
- Repository factory for centralized ownership
- Neurodivergent-friendly seed data with realistic examples
- Enhanced task types (TaskStatus, CreateTaskInput, UpdateTaskInput)
- Storage keys constants for namespaced MMKV storage

### Changed

- Refactored task architecture to repository pattern
- Migrated task store from global to feature-level (src/features/tasks/store/)
- Migrated persistence ownership from components to repository layer
- Refactored TasksScreen to thin orchestration with hooks
- Replaced direct store access with hook abstraction
- Updated mock data to be neurodivergent-friendly
- Isolated MMKV storage operations to dedicated service layer

### Architecture

- Adopted local-first data strategy with MMKV persistence
- Established scalable repository abstraction for future backend migration
- Isolated persistence layer from UI components
- Implemented feature-first domain structure with clear boundaries
- Separated concerns: repositories (data), stores (state), hooks (UI), screens (orchestration)
- Created reusable generic repository interface for all domains
- Centralized repository ownership via factory pattern

### Performance

- Optimized for FlashList usage with stable callbacks
- Memoized task filtering and sorting operations
- Isolated re-renders through feature-level stores
- Prepared architecture for scalable task lists

### Notes

- Tasks feature is now fully local-first with MMKV persistence
- Future backend migration requires minimal UI changes (swap repository in factory)
- All components follow strict separation of concerns
- No backend integration added (as per Phase 6 requirements)
- Architecture scales cleanly for habits, meals, budget, and other features

## [Phase 5 - Step 2: Task Feature Foundation]

### Added

- Created task type definitions (Task, TaskPriority, TaskFilter) in features/tasks/types/task.ts
- Created TaskRow component with custom checkbox, priority badges, and completion styling
- Created TaskList component using FlashList for performant rendering
- Created TaskFilterPills component with horizontal scroll for filtering tasks
- Created TaskSection component as reusable section wrapper with subtitle support
- Created AddTaskButton component using FloatingActionButton with lucide-react-native Plus icon
- Created EmptyTasks component with contextual empty states based on filter
- Refactored TasksScreen to orchestrate modular task components
- Integrated useTaskStore for task state management
- Added mock data initialization from mockTasks

### Changed

- TasksScreen now uses composition pattern with dedicated task components
- Replaced inline task rendering with TaskRow and TaskList components
- Simplified TasksScreen from 132 lines to 83 lines through component extraction
- Added filtering logic (all, active, completed, high, medium, low)
- Added task completion toggle functionality
- Improved separation of concerns - screen orchestrates, components render

### Architecture Decisions

- Task components follow feature-first organization in features/tasks/components/
- Type definitions centralized in features/tasks/types/task.ts
- Custom checkbox implementation using TouchableOpacity to avoid missing UI primitive
- FlashList used for scalable task list performance
- Local component state for filter selection (UI state pattern)
- Store state for task data (domain state pattern)
- Mock data seeding on mount for development
- Token-backed styling maintained throughout all new components

### Fixed

- Fixed FlashList prop error by removing unsupported estimatedItemSize
- Fixed TaskSection to properly wrap children content

## [Phase 5 - Step 1: Dashboard Implementation]

### Added

- Created DashboardHeader component with greeting and avatar
- Created TodayFocusCard component wrapping FocusCard for dashboard-specific focus display
- Created QuickActions component with lucide-react-native icons (Plus, Clock, CheckCircle, FileText)
- Created WeeklyProgress component wrapping ProgressCard for weekly goals display
- Created DashboardSection component as a reusable section wrapper with SectionHeader integration
- Refactored DashboardScreen to orchestrate modular dashboard components

### Changed

- DashboardScreen now uses composition pattern with dedicated dashboard components
- Removed inline mock icons in favor of lucide-react-native icons
- Simplified DashboardScreen from 123 lines to 73 lines through component extraction
- Improved separation of concerns - screen orchestrates, components render

### Architecture Decisions

- Dashboard components follow feature-first organization in features/dashboard/components/
- Thin screen architecture - DashboardScreen only orchestrates, no rendering logic
- Static mock data only - no business logic or state management yet
- Component composition over monolithic screen files
- Token-backed styling maintained throughout all new components

## [Foundation Setup]

### Completed

- Configured Expo Router with Stack navigation
- Updated root layout with hidden headers and calm background (#F8F7FC)
- Created production folder structure (app, components, features, hooks, services, store, theme, types, utils, constants)
- Configured NativeWind with tailwind.config.js, babel.config.js, and nativewind-env.d.ts
- Created design token system (colors, spacing, radius, shadows, typography, tokens)
- Configured Tailwind theme extensions with token-backed values
- Created core UI primitive structure (Screen, Card, Button, IconButton, Text, Input, EmptyState, SectionHeader, ProgressBar, Avatar, FloatingActionButton, BottomSheet)
- Added utility helpers (cn.ts with clsx and tailwind-merge)
- Created initial tab route structure (Dashboard, Tasks, Calendar, Health, More)
- Established feature-first organization with modular subdirectories

### Notes

- No feature screens implemented yet (only placeholders)
- No backend integration yet
- Design tokens follow calm, cinematic, breathable, premium aesthetic
- Primary gradient direction: #89fffd → #ef32d9
- All architecture follows feature-first, local-first, and modular state principles

## [State Architecture + MMKV Persistence]

### Completed

- Configured MMKV storage layer with createMMKV() for react-native-mmkv v4+
- Created reusable storage utilities (getItem, setItem, removeItem, hasItem, clearAll, getAllKeys)
- Implemented shared persist helper (createPersistStorage.ts) bridging MMKV with Zustand persist middleware
- Built production-ready Zustand stores following strict domain isolation:
  - useTaskStore with typed CRUD operations (no persistence - transient data)
  - useHabitStore with typed CRUD operations and MMKV persistence
  - useMealStore with typed CRUD operations (no persistence - transient data)
  - useBudgetStore with typed CRUD operations for transactions and budgets (no persistence)
  - useSettingsStore with MMKV persistence for app preferences and onboarding state
- Applied consistent store pattern: State type, Actions type, Store = State & Actions
- Created mock seed data for tasks (8 realistic tasks) and habits (8 realistic habits)
- Implemented repository layer foundations with local-first architecture:
  - taskRepository with async CRUD methods
  - habitRepository with async CRUD and frequency/date filtering
  - mealRepository with async CRUD and nutrition calculation
  - budgetRepository with async CRUD and budget status checking
- Created comprehensive state architecture documentation (docs/state-architecture.md)
- Documented persistence rules (persist: habits, settings, preferences; don't persist: UI state, modals, filters)
- Documented domain isolation principles and anti-patterns to avoid
- Updated existing MMKV service placeholder to use proper createMMKV() initialization

### Architecture Decisions

- Domain-driven state ownership: each domain (tasks, habits, meals, budget, settings) owns isolated state
- No monolithic global store: split by domain, not by screen or feature
- Typed actions: all stores use TypeScript with explicit State, Actions, and Store types
- Strategic persistence: only persist domain data that should survive app restarts (habits, settings)
- UI state in components: modal visibility, filters, form state use React useState
- Repository pattern: abstracts storage ownership for future backend integration without UI changes
- Thin stores: stores focus on state management, repositories handle business logic
- Granular subscriptions: use selectors to avoid unnecessary rerenders

### Persistence Configuration

- Habits: persisted with MMKV (user's habit tracking data)
- Settings: persisted with MMKV (theme, language, notifications, onboarding state)
- Tasks: not persisted (transient, can be re-fetched from backend)
- Meals: not persisted (transient, can be re-fetched from backend)
- Budget: not persisted (transient, can be re-fetched from backend)

### Notes

- MMKV properly initialized with createMMKV() for react-native-mmkv v4.3.1
- All stores follow the pattern: type State = {}, type Actions = {}, type Store = State & Actions
- Repository classes are backend-ready with async methods for future API integration
- Mock data available for development and testing without backend dependency
- No direct MMKV usage in UI components - all storage abstracted through stores/repositories
