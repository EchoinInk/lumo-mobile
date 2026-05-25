export const StorageKeys = {
  // Domain data
  TASKS: "tasks",
  HABITS: "habits",
  MEALS: "meals",
  BUDGET: "budget",

  // User preferences
  USER_SETTINGS: "user_settings",
  ONBOARDING: "onboarding",

  // Sync system
  SYNC_QUEUE: "sync_queue_entries",
  SYNC_LAST_SYNC_AT: "sync_last_sync_at",

  // Auth (non-sensitive — tokens stored in SecureStore)
  AUTH_USER_CACHE: "auth_user_cache",
} as const;
