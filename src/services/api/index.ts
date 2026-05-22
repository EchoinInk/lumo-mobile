/**
 * API Service Barrel
 *
 * Re-exports the API client, domain API stubs, and the Supabase
 * client (dormant until auth is introduced).
 *
 * UI code should NEVER import from this module directly —
 * always go through repositories or feature services.
 *
 * Import order:
 *   1. Generic HTTP client (fetch wrapper, no backend coupling)
 *   2. Domain API stubs (future REST endpoints)
 *   3. Supabase client (future auth + realtime)
 */

export { authApi } from "./auth";
export { budgetApi } from "./budget";
export { apiClient } from "./client";
export { habitsApi } from "./habits";
export { mealsApi } from "./meals";
export { tasksApi } from "./tasks";

// Supabase client — dormant until Phase 10 (auth).
// Keep the export so existing references don't break.
export { supabase } from "./supabase";
