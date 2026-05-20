/**
 * Authentication Types
 *
 * Strongly typed auth contracts.
 * Maps Supabase auth to app-level domain types.
 */

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: AuthUser;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  displayName?: string;
}

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'restoring';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  session: AuthSession | null;
  error: string | null;
  isHydrated: boolean;
}

export interface AuthActions {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  setHydrated: () => void;
}

export type AuthStore = AuthState & AuthActions;
