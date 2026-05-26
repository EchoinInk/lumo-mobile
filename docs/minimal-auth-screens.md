# Minimal Auth Screens

## Phase 13.3 — Minimal Auth Screens + Guarded Entry

Thinnest possible auth UI layer on top of Phase 13.2 auth infrastructure. Proves auth flow works without overbuilding auth UX.

## Overview

Phase 13.3 adds minimal login/signup screens, guarded account route, and logout flow. This phase is UI-only — no auth infrastructure changes, no social login, no analytics, no destructive migration.

### Core Principles

- Screens remain thin and minimal
- Auth logic lives in hooks/services, not screens
- Calm, non-alarming feedback states
- Guest mode preserved
- Local-first behavior preserved
- No onboarding rewrites
- No destructive guest → account migration

## Route Structure

```
src/app/
├── auth/
│   ├── _layout.tsx      # Auth stack layout
│   ├── login.tsx        # Login screen
│   └── signup.tsx       # Signup screen
└── (tabs)/
    └── more/
        ├── index.tsx    # More screen with account entry
        └── account.tsx  # Guarded account screen
```

## Auth Flow

### Login Flow

```
User taps "Sign in" on More screen
    ↓
Navigate to /auth/login
    ↓
User enters email/password
    ↓
Tap "Sign in"
    ↓
useAuthForm.signIn() called
    ↓
signInWithEmailPassword() from auth service
    ↓
Supabase auth validates credentials
    ↓
On success:
    - beginGuestUpgrade() transition
    - setAuthenticatedSession() in store
    - finalizeGuestUpgrade() transition
    - Navigate to /more/account
```

### Signup Flow

```
User taps "Create an account" on More screen
    ↓
Navigate to /auth/signup
    ↓
User enters email/password
    ↓
Tap "Create account"
    ↓
useAuthForm.signUp() called
    ↓
signUpWithEmailPassword() from auth service
    ↓
Supabase auth creates account
    ↓
On success:
    - beginGuestUpgrade() transition
    - setAuthenticatedSession() in store
    - finalizeGuestUpgrade() transition
    - Navigate to /more/account
```

### Logout Flow

```
User taps "Sign out" on account screen
    ↓
handleLogout() called
    ↓
beginLogoutTransition() transition
    ↓
signOutSession() from auth service
    ↓
signOut() from auth session store
    ↓
finalizeLogoutTransition() transition
    ↓
Navigate back to More screen
    ↓
Guest mode restored
```

## Auth Form Hook

### Location

`src/features/auth/hooks/useAuthForm.ts`

### Responsibilities

- Manage email/password form state
- Validate required fields
- Expose loading/error/success state
- Call auth service methods
- Never call Supabase directly

### API

```typescript
const {
  email,
  password,
  setEmail,
  setPassword,
  isSubmitting,
  error,
  success,
  signIn,
  signUp,
  reset,
} = useAuthForm();
```

### Validation Rules

- Email required and must include "@"
- Password required and must be at least 6 characters

### Error Normalization

Supabase errors are normalized into calm user-facing messages:

- "Invalid login credentials" → "We couldn't sign you in. Please check your email and password."
- "User already registered" → "An account with this email already exists. Please sign in instead."
- "Email not confirmed" → "Please confirm your email address before signing in."
- Default → "Something went wrong. Please try again."

## Auth Service Methods

### Location

`src/services/api/auth/supabaseAuth.session.ts`

### Methods Added

```typescript
signInWithEmailPassword(email: string, password: string)
  → Promise<SupabaseAuthResult<SupabaseAuthSession>>

signUpWithEmailPassword(email: string, password: string)
  → Promise<SupabaseAuthResult<SupabaseAuthSession>>
```

### Behavior

- Map Supabase responses into internal AuthUser/session types
- Normalize errors into safe user-facing messages
- Do not leak raw Supabase errors into UI
- No social login
- No magic links

## Session Store Integration

### On Successful Auth

```typescript
// Begin guest upgrade transition
beginGuestUpgrade(localOwnerId, cloudOwnerId);

// Update auth session store
setAuthenticatedSession(localOwnerId, cloudOwnerId);

// Finalize guest upgrade transition
finalizeGuestUpgrade();
```

### On Logout

```typescript
// Begin logout transition
beginLogoutTransition(cloudOwnerId, cloudOwnerId);

// Sign out from Supabase
await signOutSession();

// Sign out from session store
await signOut();

// Finalize logout transition
finalizeLogoutTransition();
```

## Guarded Account Screen

### Location

`app/(tabs)/more/account.tsx`

### Behavior

- Uses `AuthGuard` with `requireAuthenticated` mode
- If unauthenticated, shows calm fallback with login/signup actions
- If authenticated, shows:
  - Signed-in email
  - Account ID (truncated)
  - Sign out button

### Fallback Content

```
Sign in required
You need to be signed in to view your account

[Sign in]
[Create an account]
[Back]
```

## Logout Behavior

### Rules

- Logout must not globally wipe app data
- Logout must isolate authenticated partitions only if safe
- Guest mode must remain available after logout
- Sync queue must not leak across ownership contexts

### Implementation

1. Begin logout transition (pauses sync)
2. Sign out from Supabase
3. Sign out from session store (generates new localOwnerId)
4. Finalize logout transition (resumes sync)
5. Navigate back to More screen

### Guest Data Preservation

- Guest data is NOT deleted during logout
- Guest partitions remain intact
- New localOwnerId is generated for fresh guest session
- Old guest data is orphaned (cleanup in Phase 13.4)

## Navigation Entry Point

### More Screen Updates

`app/(tabs)/more/index.tsx`

- Added "Account" / "Sign in" feature as first item
- Icon changes based on auth state:
  - Guest: LogIn icon, "Sign in" label
  - Authenticated: User icon, "Account" label
- Route: `/more/account`

### Primary Tabs Unchanged

- Dashboard
- Tasks
- Calendar
- Health
- More

No auth tab added.

## Feedback States

### Loading

- Button shows `ActivityIndicator` when `isSubmitting` is true
- Button disabled during submission

### Invalid Form

- Error message shown below form fields
- Input border turns red on error

### Auth Error

- Calm error message displayed
- No harsh red error walls
- No urgent language

### Logged-Out Fallback

- Calm message: "Sign in required"
- Clear call-to-action buttons
- No modal-heavy flows

### Example Messages

- "We couldn't sign you in. Please check your email and password."
- "An account with this email already exists. Please sign in instead."
- "Your account is ready."
- "You're using Lumo as a guest."

## Architecture

### Flow

```
Screen
  → Auth Hook (useAuthForm)
    → Auth Service (supabaseAuth.session)
      → Supabase Auth API Layer
```

### Never

```
Screen → Supabase directly
```

## Files Created

**Auth Routes**

- `src/app/auth/_layout.tsx` — Auth stack layout
- `src/app/auth/login.tsx` — Login screen
- `src/app/auth/signup.tsx` — Signup screen

**Account Route**

- `app/(tabs)/more/account.tsx` — Guarded account screen

**Auth Hook**

- `src/features/auth/hooks/useAuthForm.ts` — Auth form state management

## Files Modified

**Auth Service**

- `src/services/api/auth/supabaseAuth.session.ts` — Added `signInWithEmailPassword`, `signUpWithEmailPassword`
- `src/services/api/auth/index.ts` — Re-exported new methods

**More Screen**

- `app/(tabs)/more/index.tsx` — Added account/sign-in entry with conditional icon

## What Phase 13.3 Does NOT Do

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

## Verification

- ✅ TypeScript passes with no errors
- ✅ App boots successfully
- ✅ Guest mode still works
- ✅ Login screen renders
- ✅ Signup screen renders
- ✅ Account screen is guarded
- ✅ Logout returns to guest mode
- ✅ Screens do not import Supabase SDK
- ✅ Repositories do not import Supabase SDK
- ✅ Auth UI does not delete guest data
- ✅ More screen entry works

## Risks

1. **Guest Data Orphaning** — Logout generates new localOwnerId, orphaning old guest data. Cleanup needed in Phase 13.4.
2. **Session Restoration Timing** — Race conditions possible if auth state not awaited before navigation.
3. **Error Normalization** — Some Supabase errors may not be covered by normalization rules.
4. **Transition Stuck** — Transition orchestrator needs timeout handling to prevent stuck transitions.

## Deferred Work

Recommended next phases:

- Phase 13.4 — Implement destructive guest → account migration
- Phase 13.5 — Migrate all features to RepositoryContext pattern
- Phase 13.6 — Add social login providers
- Phase 13.7 — Integrate analytics with auth
- Phase 13.8 — Add push notifications with auth

## Summary

Phase 13.3 successfully adds minimal auth UI on top of the Phase 13.2 infrastructure. The implementation is UI-only, with no auth infrastructure changes. Screens remain thin, auth logic lives in hooks/services, and guest mode is preserved.

The architecture maintains the critical separation between UI and auth layer, ensuring that screens never talk directly to Supabase. All auth operations flow through the auth form hook and auth service, preserving the feature-first architecture.

Logout safely returns to guest mode without deleting guest data, and the account screen is properly guarded with calm fallback states.

The next phase (13.4) will implement destructive guest → account migration, building on this solid UI foundation.
