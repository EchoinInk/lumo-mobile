/**
 * Auth API
 *
 * Stub layer for future authentication endpoints.
 * No real network calls are made yet — all methods return
 * placeholder responses so the rest of the architecture can
 * be wired up without a live backend.
 *
 * When Supabase Auth is introduced, replace the stub bodies
 * here. Nothing outside this file needs to change.
 *
 * Flow: UI → useAuth hook → authService → authApi (this file)
 */

import type { ApiResponse } from '@/types/api';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: string;
}

/**
 * Auth API — stub implementations.
 * Replace bodies with real API calls once backend is connected.
 */
export const authApi = {
  /**
   * Sign in with email + password.
   * @stub Returns a rejection to signal "not yet implemented".
   */
  async signIn(_credentials: AuthCredentials): Promise<ApiResponse<AuthSession>> {
    // TODO: POST /auth/sign-in
    return { data: null, error: { message: 'Auth not yet connected' } };
  },

  /**
   * Register a new account.
   * @stub Returns a rejection to signal "not yet implemented".
   */
  async signUp(_credentials: AuthCredentials): Promise<ApiResponse<AuthSession>> {
    // TODO: POST /auth/sign-up
    return { data: null, error: { message: 'Auth not yet connected' } };
  },

  /**
   * Sign out the current user.
   * @stub No-op until backend is connected.
   */
  async signOut(): Promise<ApiResponse<void>> {
    // TODO: POST /auth/sign-out
    return { data: null, error: null };
  },

  /**
   * Refresh the current session.
   * @stub Returns a rejection to signal "not yet implemented".
   */
  async refreshSession(_refreshToken: string): Promise<ApiResponse<AuthSession>> {
    // TODO: POST /auth/refresh
    return { data: null, error: { message: 'Auth not yet connected' } };
  },

  /**
   * Fetch the currently authenticated user profile.
   * @stub Returns null data until backend is connected.
   */
  async getUser(): Promise<ApiResponse<AuthUser>> {
    // TODO: GET /auth/user
    return { data: null, error: null };
  },

  /**
   * Request a password reset email.
   * @stub No-op until backend is connected.
   */
  async resetPassword(_email: string): Promise<ApiResponse<void>> {
    // TODO: POST /auth/reset-password
    return { data: null, error: null };
  },
} as const;
