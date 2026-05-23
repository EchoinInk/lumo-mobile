/**
 * Auth Service
 *
 * Canonical Supabase auth operations.
 * No UI logic. No routing. No store access.
 *
 * Responsibilities:
 * - signUp / signIn / signOut
 * - resetPassword
 * - getCurrentUser
 *
 * Flow: UI → useAuth hook → authService (this file) → Supabase
 *
 * All methods return AuthResult<T> — never throw raw exceptions.
 */

import { env } from "@/config/env";
import { supabase } from "./supabase";

// ── Result Type ───────────────────────────────────────────────────────────

export interface AuthResult<T = void> {
  data: T | null;
  error: string | null;
}

// ── Domain Types ─────────────────────────────────────────────────────────

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unexpected error occurred";
}

function notConfigured<T>(): AuthResult<T> {
  return { data: null, error: "Supabase is not configured" };
}

// ── Auth Operations ───────────────────────────────────────────────────────

/**
 * Register a new user with email + password.
 */
export async function signUp(
  credentials: AuthCredentials,
): Promise<AuthResult<AuthUser>> {
  if (!env.isConfigured || !supabase) return notConfigured();
  try {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) return { data: null, error: normalizeError(error) };
    if (!data.user)
      return { data: null, error: "No user returned from sign-up" };
    return {
      data: {
        id: data.user.id,
        email: data.user.email ?? "",
        createdAt: data.user.created_at ?? new Date().toISOString(),
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

/**
 * Sign in an existing user with email + password.
 */
export async function signIn(
  credentials: AuthCredentials,
): Promise<AuthResult<AuthUser>> {
  if (!env.isConfigured || !supabase) return notConfigured();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) return { data: null, error: normalizeError(error) };
    if (!data.user)
      return { data: null, error: "No user returned from sign-in" };
    return {
      data: {
        id: data.user.id,
        email: data.user.email ?? "",
        createdAt: data.user.created_at ?? new Date().toISOString(),
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

/**
 * Sign out the current user.
 * Local-first: always clears local session even if network fails.
 */
export async function signOut(): Promise<AuthResult> {
  if (!env.isConfigured || !supabase) return { data: null, error: null };
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { data: null, error: normalizeError(error) };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  if (!env.isConfigured || !supabase) return notConfigured();
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { data: null, error: normalizeError(error) };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

/**
 * Get the currently authenticated user, if any.
 * Returns null data (not an error) when no session exists.
 */
export async function getCurrentUser(): Promise<AuthResult<AuthUser>> {
  if (!env.isConfigured || !supabase) return { data: null, error: null };
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return { data: null, error: normalizeError(error) };
    if (!data.user) return { data: null, error: null };
    return {
      data: {
        id: data.user.id,
        email: data.user.email ?? "",
        createdAt: data.user.created_at ?? new Date().toISOString(),
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: normalizeError(err) };
  }
}

/**
 * Compatibility shim — kept so existing code importing authApi doesn't break.
 * New code should call the named functions above directly.
 */
export const authApi = {
  signUp,
  signIn,
  signOut,
  resetPassword,
  getCurrentUser,
} as const;
