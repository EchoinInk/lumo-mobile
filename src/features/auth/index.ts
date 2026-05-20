/**
 * Auth Feature Barrel
 *
 * Public API for auth functionality.
 * Screens and hooks consume from here — never reach into internals.
 */

export { useAuthStore } from './store/useAuthStore';
export type {
  AuthUser,
  AuthSession,
  AuthStatus,
  SignInCredentials,
  SignUpCredentials,
} from './types/auth';
