/**
 * API Service Barrel
 *
 * Re-exports the API client, auth service, session service,
 * domain API stubs, and the Supabase client.
 *
 * UI code should NEVER import from this module directly —
 * always go through repositories or feature services.
 *
 * Import order:
 *   1. Generic HTTP client (fetch wrapper, no backend coupling)
 *   2. Auth service (Supabase auth operations)
 *   3. Session service (session lifecycle)
 *   4. Domain API stubs (future REST endpoints)
 *   5. Supabase client (infrastructure)
 */

export { apiClient } from "./client";

// Auth service — named functions + compat shim
export {
    authApi, getCurrentUser, resetPassword, signIn,
    signOut, signUp
} from "./auth";
export type { AuthCredentials, AuthResult, AuthUser } from "./auth";

// Session service
export {
    getAccessToken,
    getCurrentUserId, restoreSession,
    subscribeToAuthChanges
} from "./session";
export type {
    AuthStateCallback, RestoredSession, SessionUser
} from "./session";

// Domain API stubs
export { budgetApi } from "./budget";
export { habitsApi } from "./habits";
export { mealsApi } from "./meals";
export { tasksApi } from "./tasks";

// Supabase client — infrastructure only
export { supabase } from "./supabase";
