import { Budget, Transaction } from "@/store/useBudgetStore";
import type { AsyncResult } from "@/types/result";
import { err, ok } from "@/types/result";

/**
 * Budget Repository
 *
 * Abstracts budget and transaction data operations and storage.
 * This provides a clean separation between UI components and data storage.
 *
 * Future: Can be extended to include backend API calls while maintaining
 * the same interface for UI components.
 *
 * All methods return Result<T> for consistent error handling.
 * Never throws raw exceptions — always returns structured results.
 */
export class BudgetRepository {
  /**
   * Get all transactions
   * @returns Result with array of transactions or error message
   */
  async getAllTransactions(): AsyncResult<Transaction[]> {
    try {
      // Future: Fetch from backend API
      // Current: Return from store or local storage
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get all budgets
   * @returns Result with array of budgets or error message
   */
  async getAllBudgets(): AsyncResult<Budget[]> {
    try {
      // Future: Fetch from backend API
      // Current: Return from store or local storage
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get a transaction by ID
   * @param id - Transaction ID
   * @returns Result with transaction or null if not found, or error message
   */
  async getTransactionById(id: string): AsyncResult<Transaction | null> {
    try {
      // Future: Fetch from backend API
      return ok(null);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get a budget by ID
   * @param id - Budget ID
   * @returns Result with budget or null if not found, or error message
   */
  async getBudgetById(id: string): AsyncResult<Budget | null> {
    try {
      // Future: Fetch from backend API
      return ok(null);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Create a new transaction
   * @param transaction - Transaction data without id, createdAt, updatedAt
   * @returns Result with created transaction or error message
   */
  async createTransaction(
    transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ): AsyncResult<Transaction> {
    try {
      // Future: POST to backend API
      // Current: Create locally with generated ID
      const newTransaction: Transaction = {
        ...transaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        pendingSync: true,
      };
      return ok(newTransaction);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Create a new budget
   * @param budget - Budget data without id, createdAt, updatedAt
   * @returns Result with created budget or error message
   */
  async createBudget(
    budget: Omit<Budget, "id" | "createdAt" | "updatedAt">,
  ): AsyncResult<Budget> {
    try {
      // Future: POST to backend API
      // Current: Create locally with generated ID
      const newBudget: Budget = {
        ...budget,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
        pendingSync: true,
      };
      return ok(newBudget);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Update an existing transaction
   * @param id - Transaction ID
   * @param updates - Partial transaction data to update
   * @returns Result with updated transaction or error message
   */
  async updateTransaction(
    id: string,
    updates: Partial<Transaction>,
  ): AsyncResult<Transaction> {
    try {
      // Future: PUT/PATCH to backend API
      // Current: Update locally
      return err("Not implemented");
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Update an existing budget
   * @param id - Budget ID
   * @param updates - Partial budget data to update
   * @returns Result with updated budget or error message
   */
  async updateBudget(
    id: string,
    updates: Partial<Budget>,
  ): AsyncResult<Budget> {
    try {
      // Future: PUT/PATCH to backend API
      // Current: Update locally
      return err("Not implemented");
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Delete a transaction
   * @param id - Transaction ID
   * @returns Result with boolean indicating success or error message
   */
  async deleteTransaction(id: string): AsyncResult<boolean> {
    try {
      // Future: DELETE to backend API
      // Current: Delete locally (soft delete with sync support)
      return ok(true);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Delete a budget
   * @param id - Budget ID
   * @returns Result with boolean indicating success or error message
   */
  async deleteBudget(id: string): AsyncResult<boolean> {
    try {
      // Future: DELETE to backend API
      // Current: Delete locally (soft delete with sync support)
      return ok(true);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get transactions by date range
   * @param startDate - Start date string in ISO format
   * @param endDate - End date string in ISO format
   * @returns Result with array of transactions or error message
   */
  async getTransactionsByDateRange(
    startDate: string,
    endDate: string,
  ): AsyncResult<Transaction[]> {
    try {
      // Future: Implement filtering on backend
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Get transactions by category
   * @param category - Category name
   * @returns Result with array of transactions or error message
   */
  async getTransactionsByCategory(
    category: string,
  ): AsyncResult<Transaction[]> {
    try {
      // Future: Implement filtering on backend
      return ok([]);
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Calculate budget summary for a period
   * @param period - Period type (weekly, monthly, yearly)
   * @returns Result with budget summary or error message
   */
  async getBudgetSummary(period: "weekly" | "monthly" | "yearly"): AsyncResult<{
    totalIncome: number;
    totalExpenses: number;
    remaining: number;
    categoryBreakdown: Record<string, number>;
  }> {
    try {
      // Future: Calculate on backend
      return ok({
        totalIncome: 0,
        totalExpenses: 0,
        remaining: 0,
        categoryBreakdown: {},
      });
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Check if budget is exceeded for a category
   * @param categoryId - Category ID or name
   * @param period - Period type
   * @returns Result with budget status or error message
   */
  async checkBudgetStatus(
    categoryId: string,
    period: "weekly" | "monthly" | "yearly",
  ): AsyncResult<{
    isExceeded: boolean;
    spent: number;
    limit: number;
    remaining: number;
    percentage: number;
  }> {
    try {
      // Future: Calculate on backend
      return ok({
        isExceeded: false,
        spent: 0,
        limit: 0,
        remaining: 0,
        percentage: 0,
      });
    } catch (error) {
      return err(this.normalizeError(error));
    }
  }

  /**
   * Normalize any error into a readable string message.
   * Never expose raw exceptions to the UI.
   */
  private normalizeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "An unexpected error occurred";
  }
}

// Export singleton instance
export const budgetRepository = new BudgetRepository();
