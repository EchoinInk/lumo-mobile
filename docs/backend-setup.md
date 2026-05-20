# Backend & Sync Architecture — Setup Guide

## Prerequisites

- Expo SDK 52+
- Node.js 18+
- A Supabase project ([supabase.com](https://supabase.com))

## Environment Variables

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials from **Project Settings → API**:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Never** commit `.env` — it's gitignored.

## Architecture Overview

```
Screen
  → Feature Hook
    → Repository
      → Local (MMKV) + Sync Queue
        → Supabase (when online)
```

### Key Principles

- **Local-first**: All writes hit MMKV immediately. UI never waits for network.
- **Optimistic updates**: State changes are instant. Sync happens in background.
- **Queue persistence**: Unsynced operations survive app restarts via MMKV.
- **Network awareness**: Sync auto-triggers when connectivity resumes.
- **Repository pattern**: UI code never touches Supabase directly.

## Data Flow

### Write Path
```
User Action
  → Hook calls repository.createTask()
    → TaskSyncRepository
      → 1. Write to MMKV (instant)
      → 2. Enqueue sync operation
      → 3. Trigger background sync (if online)
```

### Read Path
```
Hook calls repository.getTasks()
  → TaskSyncRepository
    → TaskLocalRepository
      → Read from MMKV (instant)
```

### Sync Path
```
Network comes online
  → SyncProcessor.processQueue()
    → For each pending entry:
      → Look up registered handler
      → Call Supabase API via handler
      → Mark completed or increment retry
```

## File Structure

```
src/
├── services/
│   ├── api/
│   │   ├── supabase.ts          # Typed Supabase client
│   │   └── index.ts             # API barrel
│   ├── sync/
│   │   ├── syncQueue.ts         # MMKV-persisted operation queue
│   │   ├── syncProcessor.ts     # Background queue processor
│   │   └── index.ts             # Sync barrel
│   ├── repositories/
│   │   ├── IRepository.ts       # Generic repository interface
│   │   └── index.ts             # Repository factory
│   ├── storage/
│   │   ├── mmkv.ts              # MMKV storage helpers
│   │   ├── secureStore.ts       # expo-secure-store wrapper
│   │   └── storageKeys.ts       # Centralized storage key constants
│   └── init.ts                  # App initialization bootstrap
│
├── features/
│   └── auth/
│       ├── services/
│       │   └── authService.ts   # Supabase auth operations
│       ├── store/
│       │   └── useAuthStore.ts  # Auth state management
│       ├── hooks/
│       │   └── useAuth.ts       # Auth hook for screens
│       ├── types/
│       │   └── auth.ts          # Auth type definitions
│       └── index.ts             # Auth feature barrel
│
├── types/
│   ├── api.ts                   # API response types
│   └── sync.ts                  # Sync queue types
│
├── utils/
│   ├── network.ts               # NetInfo connectivity utilities
│   └── retry.ts                 # Exponential backoff retry
│
└── hooks/
    └── use-sync-status.ts       # Sync status hook for UI
```

## Dependencies Added

| Package | Purpose |
|---|---|
| `@supabase/supabase-js` | Supabase client SDK |
| `expo-secure-store` | Secure token storage (native keychain) |
| `react-native-url-polyfill` | URL API polyfill for React Native |
| `@react-native-community/netinfo` | Network connectivity detection |

## Extending to New Features

To add sync support for a new domain (e.g., habits):

1. **Add entity type** to `SyncEntityType` in `src/types/sync.ts`
2. **Create sync repository** (copy `taskSyncRepository.ts` pattern)
3. **Register sync handler** in feature init:
   ```ts
   registerSyncHandler('habit', async (entry) => {
     // Handle create/update/delete against Supabase
   });
   ```
4. **Update repository factory** in `src/services/repositories/index.ts`

## Security Notes

- Auth tokens stored in `expo-secure-store` (iOS Keychain / Android Keystore)
- Web fallback uses `localStorage` with prefix isolation
- Supabase credentials read from environment variables only
- Row Level Security (RLS) should be enabled on all Supabase tables
