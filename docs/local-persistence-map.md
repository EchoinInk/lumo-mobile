# Local Persistence Map

Internal reference for Lumo’s local-first data layer (Phase 17.1 audit).

## Daily Relief domains

| Domain | Store / service | Storage key | Persisted fields | Hydration | Reset behavior |
| --- | --- | --- | --- | --- | --- |
| Tasks | `useTaskStore` → `taskLocalRepository` | `StorageKeys.TASKS` (`tasks`) | Full task records (soft-delete via `deletedAt`) | `hydrateTasks()` on mount; seeds mock tasks if empty | Deleted tasks soft-removed from visible list; `clearAll()` dev-only via repository |
| Recurring tasks | Same task store | Same | `recurrence`, `dueDate` on task | Same as tasks | Same as tasks |
| Today Focus | `useFocusModeStore` | `focus-mode-storage` (Zustand persist) | `activeFocusTaskId`, focus mode flags, density | Zustand `persist` rehydrate | `reset()` restores initial focus state |
| Brain Dump | `useBrainDumpStore` → `brainDumpStorage` | `StorageKeys.BRAIN_DUMP_ENTRIES` | `id`, `text`, `status`, conversion metadata | `hydrate()` once; invalid entries filtered | `clearConverted()` removes converted/archived from active list |
| Reminders | `useReminderStore` → `reminderStorage` | `StorageKeys.REMINDERS` | Reminder list | `hydrate()` once; invalid entries filtered | Archive sets `archivedAt` |
| Reminder settings | `useReminderStore` → `reminderStorage` | `StorageKeys.REMINDER_SETTINGS` | Quiet hours, tone, toggles | `hydrate()` with sanitized defaults | Partial updates merge with defaults |
| Routine bundles | Static `starterRoutineBundles` | None (in-memory templates) | N/A | N/A | N/A — “Use bundle” creates tasks only |
| Planning state | `useDailyPlanningFlow` → `planningStorage` | `StorageKeys.PLANNING_SUMMARY` | Daily summary, focus IDs, carry-over, completion flags | Load + normalize; rolls to empty summary on new day | Day rollover auto-resets; hook exposes `resetMorningPlan()` |
| Onboarding | `features/onboarding/useOnboardingStore` | `StorageKeys.ONBOARDING` | Preferences, completion | `hydrate()` with try/catch fallback | `resetOnboarding()` clears feature onboarding |
| Settings | `useSettingsStore` | `settings-storage` | Theme, notifications, accessibility prefs | Zustand persist + `hasHydrated` | `resetSettings()` restores defaults |
| Calm mode | `useCalmModeStore` | Zustand persist key in store | Calm mode toggles | Zustand persist | Store `reset` action |
| Habits (legacy) | `habitLocalRepository` | `StorageKeys.HABITS` | Habit records | Repository load | Repository delete |

## Architecture rules

- Route files under `app/` do not read/write MMKV directly.
- Components use feature hooks/stores; stores call storage services or repositories.
- `planningComposer.ts` is pure — no persistence.
- Storage keys for Daily Relief domains live in `src/services/storage/storageKeys.ts`.

## Notes

- Task mutations persist the **visible store list** via `persistVisibleTasks()` to avoid duplicate IDs between store and MMKV.
- Planning summaries from prior days are discarded on load (fresh day = empty summary).
- Invalid JSON or malformed records fall back to safe defaults without crashing boot.
