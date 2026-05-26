# Supabase Auth Core Architecture

## Phase 13.2 — Supabase Auth Integration Core

Infrastructure-first phase implementing actual auth/session infrastructure using Supabase Auth without introducing auth debt, UI coupling, or breaking local-first behavior.

## Overview

Phase 13.2 wires Supabase Auth into the Lumo mobile app while preserving the architecture established in Phase 13.1. This phase is infrastructure-only — no polished auth UI, no social login, no onboarding rewrites, no analytics, no push notifications.

### Core Principles

- **UI never talks directly to Supabase** — Flow remains: Screen → Feature Hook → Repository → API Service
- **Local-first UX is mandatory** — User actions remain instant and sync in the background
- **Ownership is explicit** — Repositories receive ownership via RepositoryContext, never from global state
- **Storage is partitioned** — Guest and authenticated user data are isolated
- **Migration is safe** — Guest → account migration is planned and tracked before execution
- **Offline-safe behavior** — App remains usable offline, expired sessions gracefully fallback

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│ UI Layer (Screens, Components)                               │
│ - Never imports Supabase SDK                                 │
│ - Uses feature hooks for auth state                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Feature Hooks (useSessionBootstrap, useAuthGuard)            │
│ - Provide auth state to UI                                   │
│ - Handle session lifecycle                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Auth Session Store (useAuthSessionStore)                    │
│ - Tracks account mode (guest/authenticated)                  │
│ - Maintains ownership IDs (localOwnerId, cloudOwnerId)      │
│ - Hydrates from Supabase on startup                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Repository Context (repositoryContext.ts)                     │
│ - Provides ownership to repositories                         │
│ - Created from auth session or Supabase session              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Repositories (taskLocalRepository, etc.)                     │
│ - Use RepositoryContext for ownership-safe operations         │
│ - Never infer ownership from global state                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Auth Layer (src/services/api/auth/)                          │
│ - Supabase client initialization                             │
│ - Session management (getCurrentSession, signOutSession)      │
│ - Type mapping (Supabase → canonical types)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Supabase Auth (External)                                     │
│ - Session persistence via SecureStore                        │
│ - Token refresh                                             │
└─────────────────────────────────────────────────────────────┘
```

## Auth Lifecycle

### Session Hydration Flow

```
App Startup
    ↓
useSessionBootstrap() called
    ↓
hydrateSession() invoked
    ↓
restorePersistedSession() from Supabase
    ↓
Session valid?
    ├─ Yes → Set authenticated mode
    │       - Set cloudOwnerId
    │       - Set authUser
    │       - Set sessionStatus: "authenticated"
    │
    └─ No → Set guest mode
            - Generate localOwnerId
            - Set sessionStatus: "guest"
    ↓
Auth session ready
```

### Sign Out Flow

```
User signs out
    ↓
signOut() invoked
    ↓
signOutSession() from Supabase
    ↓
Clear Supabase session
    ↓
Reset auth session store
    ↓
Generate new localOwnerId
    ↓
Set guest mode
    ↓
Clear authenticated partitions (optional)
```

## Ownership Model

### Guest Mode

- **localOwnerId**: Generated once, persists across sessions
- **cloudOwnerId**: null
- **storagePartitionKey**: `guest:{localOwnerId}`
- **syncPartitionKey**: `guest:{localOwnerId}:syncQueue`
- **Sync upload**: Never uploads to cloud

### Authenticated Mode

- **localOwnerId**: Preserved from guest state or generated
- **cloudOwnerId**: From Supabase user ID
- **storagePartitionKey**: `user:{cloudOwnerId}`
- **syncPartitionKey**: `user:{cloudOwnerId}:syncQueue`
- **Sync upload**: May upload to cloud (future)

### Storage Key Patterns

```
Guest entities:
  guest:{localOwnerId}:tasks
  guest:{localOwnerId}:habits
  guest:{localOwnerId}:meals
  guest:{localOwnerId}:budget
  guest:{localOwnerId}:workouts
  guest:{localOwnerId}:calendar

Authenticated entities:
  user:{cloudOwnerId}:tasks
  user:{cloudOwnerId}:habits
  user:{cloudOwnerId}:meals
  user:{cloudOwnerId}:budget
  user:{cloudOwnerId}:workouts
  user:{cloudOwnerId}:calendar

Sync queues:
  guest:{localOwnerId}:syncQueue
  user:{cloudOwnerId}:syncQueue

Migration metadata:
  guest:{localOwnerId}:migration
  user:{cloudOwnerId}:migration
```

## Guest → Authenticated Transitions

### Transition Orchestrator

The `authTransitionOrchestrator.ts` coordinates transitions:

- **beginGuestUpgrade()**: Marks transition as in progress, pauses sync
- **finalizeGuestUpgrade()**: Marks transition as completed, resumes sync
- **beginLogoutTransition()**: Marks logout as in progress, pauses sync
- **finalizeLogoutTransition()**: Marks logout as completed, resets to guest

### Transition States

```
pending → in_progress → completed
                     ↘ failed
```

### Migration Safety

- No destructive migration in Phase 13.2
- No guest data deletion
- No automatic sync replay
- Migration state tracked in `AccountMigrationPlan` (Phase 13.1)

## Repository Context Flow

### Context Creation

```typescript
// From auth session store
const context = getRepositoryContext();

// From Supabase session
const context = createRepositoryContextFromSession(session, localOwnerId);

// From AuthUser
const context = createRepositoryContextFromAuthUser(authUser);

// Explicit guest context
const context = createGuestRepositoryContext(localOwnerId);

// Explicit authenticated context
const context = createAuthenticatedRepositoryContext(localOwnerId, cloudOwnerId);
```

### Context Usage in Repositories

```typescript
class TaskLocalRepository {
  private context?: RepositoryContext;

  setRepositoryContext(context: RepositoryContext) {
    this.context = context;
  }

  async getTasks(): Promise<Task[]> {
    const context = this.context || getRepositoryContext();
    const storageKey = getEntityStorageKey("tasks", context);
    return storage.get(storageKey);
  }
}
```

## Sync Ownership Enforcement

### Ownership Validation

Sync queue items must have valid ownership metadata:

- **ownerType**: "guest" or "authenticated"
- **localOwnerId**: Always present
- **cloudOwnerId**: Present for authenticated items
- **syncPartitionKey**: Matches ownership pattern
- **createdDuringMigration**: Flag for migration-created items

### Upload Eligibility

```typescript
// Guest items never upload
if (item.ownerType === "guest") {
  return false; // Not eligible for upload
}

// Migration-created items pause
if (item.createdDuringMigration) {
  return false; // Not eligible for upload
}

// Only authenticated items can upload
return item.ownerType === "authenticated";
```

### Ownership Assertions

```typescript
// Assert guest ownership
assertGuestOwned(item);

// Assert authenticated ownership
assertAuthenticatedOwned(item);

// Assert not upload-eligible (for guest items)
assertNotUploadEligible(item);
```

## Storage Isolation Rules

### Clearing Rules

- **clearGuestPartitions()**: Removes all guest data for a local owner
- **clearAuthenticatedPartitions()**: Removes all authenticated data for a cloud owner
- **clearSyncPartitions()**: Removes sync queue for a context
- **clearOwnershipScopedData()**: Removes all data for a context
- **clearCloudOwnerDataPreserveGuest()**: Removes cloud data, preserves guest data

### Logout Behavior

```
Authenticated logout
    ↓
Sign out from Supabase
    ↓
Clear authenticated partitions
    ↓
Generate new localOwnerId
    ↓
Set guest mode
    ↓
Guest data preserved (not deleted)
```

### Account Switching

Future multi-account support:

- Each cloud owner has isolated partitions
- Guest data remains separate from all authenticated data
- Switching accounts clears current authenticated partitions
- Guest data is never affected by account switching

## Offline Restoration Behavior

### Session Restoration

```typescript
// On app startup
const { isRestoring, isReady, hasError } = useSessionBootstrap();

if (isRestoring) {
  // Show loading state
}

if (isReady) {
  // App is ready (guest or authenticated)
}

if (hasError) {
  // App is ready in guest mode (graceful fallback)
}
```

### Offline Behavior

- App remains usable offline
- Expired sessions gracefully fallback to guest mode
- Session restoration does not block forever
- No auth modal interruptions
- Local-first UX preserved

## Auth State Diagnostics

### Development-Only Diagnostics

```typescript
// Run all diagnostics
const report = runAuthDiagnostics();

// Log to console (dev only)
logAuthDiagnostics();
```

### Diagnostic Checks

1. **Ownership Consistency**: Validates ownership between store and context
2. **Storage Partition Consistency**: Validates storage key patterns
3. **Repository Context Integrity**: Validates required fields
4. **Migration State**: Detects stuck migration states
5. **Orphaned Sync Queue Ownership**: Detects mismatched sync items (placeholder)

## Files Created

### Auth Layer (src/services/api/auth/)

- **supabaseAuth.types.ts** — Internal Supabase auth types
- **supabaseAuth.client.ts** — Supabase client initialization with SecureStore
- **supabaseAuth.session.ts** — Session management (getCurrentSession, signOutSession, etc.)
- **supabaseAuth.mapper.ts** — Type mapping (Supabase → canonical types)
- **auth.config.ts** — Environment validation (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
- **index.ts** — Public API exports

### Auth Services (src/features/auth/services/)

- **authTransitionOrchestrator.ts** — Transition coordination (guest upgrade, logout)

### Auth Hooks (src/features/auth/hooks/)

- **useSessionBootstrap.ts** — Offline-safe session restoration

### Auth Utils (src/features/auth/utils/)

- **authDiagnostics.ts** — Development-only state validation

### Sync Ownership (src/services/sync/ownership/)

- **syncOwnership.ts** — Sync queue ownership validation and enforcement

### Storage Isolation (src/services/storage/)

- **storageIsolation.ts** — Auth-aware storage clearing utilities

## Files Modified

### Auth Store (src/features/auth/store/)

- **useAuthSessionStore.ts** — Added session lifecycle methods (hydrateSession, restoreSession, signOut), added auth state (authUser, lastSessionRestoreAt, authHydrationStatus, authError)

### Repository Context (src/services/repositories/)

- **repositoryContext.ts** — Added authenticated context factories (createRepositoryContextFromSession, createRepositoryContextFromAuthUser)

## Architecture Decisions

1. **Separate Auth Layer** — Supabase code isolated in `src/services/api/auth/` to prevent direct imports from UI
2. **Type Mapping** — Supabase types mapped immediately to canonical types to maintain single source of truth
3. **SecureStore Persistence** — Supabase tokens stored in SecureStore for security
4. **Offline-First Session Restoration** — App remains usable offline, expired sessions gracefully fallback
5. **Explicit Repository Context** — Repositories receive ownership via context, never from global state
6. **Sync Ownership Enforcement** — Guest sync items never upload, migration items pause safely
7. **Storage Isolation** — Deterministic partition clearing using known keys, no global MMKV wipe
8. **Transition Orchestrator** — Centralized transition coordination to prevent ownership corruption

## Deferred Work

### Phase 13.3 — Polished Auth UI

- Login/signup screens
- Auth modal components
- Form validation
- Error handling UI

### Phase 13.4 — Destructive Migration

- Guest → account data migration
- Guest data deletion after migration
- Conflict resolution
- Sync replay after migration

### Phase 13.5 — Full Repository Migration

- Apply RepositoryContext to all features
- Migrate habits, meals, budget, workouts, calendar
- Remove legacy storage key fallbacks

### Phase 13.6 — Social Login

- Google, Apple, GitHub providers
- OAuth flow integration
- Social login UI

### Phase 13.7 — Analytics Integration

- Auth event tracking
- User property synchronization
- Conversion funnels

### Phase 13.8 — Push Notifications

- Auth-based push tokens
- Device registration
- Notification routing

## Verification

- ✅ TypeScript passes with no errors
- ✅ App boots successfully
- ✅ Offline launch still works
- ✅ Guest mode still works
- ✅ No auth UI exists yet
- ✅ No repositories directly use Supabase SDK
- ✅ No screens directly use Supabase SDK
- ✅ Ownership metadata survives hydration
- ✅ Storage partitions remain isolated
- ✅ Logout does not corrupt local data
- ✅ Sync queue respects ownership rules

## Risks

1. **Breaking Change in Sync Queue Types** — Updated SyncQueueItem with ownership metadata. Added compatibility in Phase 13.1, but full cleanup needed in Phase 13.5.
2. **Repository Context Not Fully Adopted** — Only tasks feature updated as reference. Other features need migration in Phase 13.5.
3. **Session Restoration Timing** — Race conditions possible if hydration not awaited before repository operations.
4. **Migration State Stuck** — Transition orchestrator needs timeout handling to prevent stuck migrations.
5. **Storage Key Collisions** — If localOwnerId generation is not stable, data could be lost across sessions.

## Summary

Phase 13.2 successfully wires Supabase Auth into Lumo while preserving the architecture established in Phase 13.1. The implementation is infrastructure-only, with no auth UI, no social login, and no destructive migration. The app remains local-first, offline-safe, and ownership-aware.

The architecture maintains the critical separation between UI and auth layer, ensuring that screens never talk directly to Supabase. All auth operations flow through the auth session store and repository context, preserving the feature-first architecture.

Sync ownership enforcement ensures guest data never uploads to the cloud, and storage isolation utilities provide safe logout and account switching without corrupting guest data.

The next phase (13.3) will add polished auth UI, building on this solid infrastructure foundation.
