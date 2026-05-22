/**
 * Budget API
 *
 * Stub layer for future remote budget/transaction endpoints.
 * All methods are no-ops / empty stubs so the repository
 * pattern can reference this module without a live backend.
 *
 * When a backend is introduced, replace stub bodies here.
 * The repository contract stays unchanged — the UI never
 * imports from this file directly.
 *
 * Flow: UI → useBudget hook → budgetRepository → budgetApi (this file)
 */

import type { ApiResponse } from '@/types/api';
import type { Budget, Transaction } from '@/store/useBudgetStore';

export interface CreateTransactionInput {
  amount: number;
  category: string;
  description?: string;
  type: Transaction['type'];
  date: string;
}

export interface UpdateTransactionInput {
  amount?: number;
  category?: string;
  description?: string;
  type?: Transaction['type'];
  date?: string;
}

export interface CreateBudgetInput {
  category: string;
  limit: number;
  period: Budget['period'];
}

export interface UpdateBudgetInput {
  category?: string;
  limit?: number;
  period?: Budget['period'];
}

/**
 * Budget API — stub implementations.
 */
export const budgetApi = {
  // ── Transactions ──────────────────────────────────────────────────────────

  /**
   * Fetch all transactions for the authenticated user.
   * @stub Returns empty array until backend is connected.
   */
  async getAllTransactions(): Promise<ApiResponse<Transaction[]>> {
    // TODO: GET /transactions
    return { data: [], error: null };
  },

  /**
   * Fetch a single transaction by ID.
   * @stub Returns null until backend is connected.
   */
  async getTransactionById(_id: string): Promise<ApiResponse<Transaction>> {
    // TODO: GET /transactions/:id
    return { data: null, error: null };
  },

  /**
   * Create a new transaction on the remote backend.
   * @stub Returns null until backend is connected.
   */
  async createTransaction(_input: CreateTransactionInput): Promise<ApiResponse<Transaction>> {
    // TODO: POST /transactions
    return { data: null, error: null };
  },

  /**
   * Update an existing transaction on the remote backend.
   * @stub Returns null until backend is connected.
   */
  async updateTransaction(
    _id: string,
    _input: UpdateTransactionInput
  ): Promise<ApiResponse<Transaction>> {
    // TODO: PATCH /transactions/:id
    return { data: null, error: null };
  },

  /**
   * Delete a transaction from the remote backend.
   * @stub No-op until backend is connected.
   */
  async deleteTransaction(_id: string): Promise<ApiResponse<void>> {
    // TODO: DELETE /transactions/:id
    return { data: null, error: null };
  },

  // ── Budgets ────────────────────────────────────────────────────────────────

  /**
   * Fetch all budgets for the authenticated user.
   * @stub Returns empty array until backend is connected.
   */
  async getAllBudgets(): Promise<ApiResponse<Budget[]>> {
    // TODO: GET /budgets
    return { data: [], error: null };
  },

  /**
   * Fetch a single budget by ID.
   * @stub Returns null until backend is connected.
   */
  async getBudgetById(_id: string): Promise<ApiResponse<Budget>> {
    // TODO: GET /budgets/:id
    return { data: null, error: null };
  },

  /**
   * Create a new budget on the remote backend.
   * @stub Returns null until backend is connected.
   */
  async createBudget(_input: CreateBudgetInput): Promise<ApiResponse<Budget>> {
    // TODO: POST /budgets
    return { data: null, error: null };
  },

  /**
   * Update an existing budget on the remote backend.
   * @stub Returns null until backend is connected.
   */
  async updateBudget(_id: string, _input: UpdateBudgetInput): Promise<ApiResponse<Budget>> {
    // TODO: PATCH /budgets/:id
    return { data: null, error: null };
  },

  /**
   * Delete a budget from the remote backend.
   * @stub No-op until backend is connected.
   */
  async deleteBudget(_id: string): Promise<ApiResponse<void>> {
    // TODO: DELETE /budgets/:id
    return { data: null, error: null };
  },
} as const;
